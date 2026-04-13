import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');

@Injectable()
export class OrdersService {
    private razorpay: any;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private mailService: MailService,
    ) {
        this.razorpay = new Razorpay({
            key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
            key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
        });
    }

    private generateOrderNumber(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORD-${timestamp}-${random}`;
    }

    async create(userId: string | null, createOrderDto: CreateOrderDto) {
        let orderItemsData: { productId: string; quantity: number; price: number }[] = [];
        let subtotal = 0;

        if (userId) {
            // Get user's cart
            const cartItems = await this.prisma.cart.findMany({
                where: { userId },
                include: { product: true },
            });

            if (cartItems.length === 0) {
                throw new BadRequestException('Cart is empty');
            }

            // Verify address belongs to user
            const address = await this.prisma.address.findFirst({
                where: { id: createOrderDto.addressId, userId },
            });

            if (!address) {
                throw new NotFoundException('Address not found or does not belong to user');
            }

            // Calculate subtotal and prepare items
            orderItemsData = cartItems.map((item) => {
                const price = item.product.price * (1 - item.product.discount / 100);
                subtotal += price * item.quantity;

                if (item.product.stock < item.quantity) {
                    throw new BadRequestException(`Insufficient stock for ${item.product.name}`);
                }

                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    price,
                };
            });
        } else {
            // Guest Flow
            if (!createOrderDto.items || createOrderDto.items.length === 0) {
                throw new BadRequestException('Items are required for guest checkout');
            }

            // Verify address exists (guest address)
            const address = await this.prisma.address.findUnique({
                where: { id: createOrderDto.addressId },
            });

            if (!address) {
                throw new NotFoundException('Address not found');
            }

            // Calculate subtotal and prepare items for guest
            for (const itemDto of createOrderDto.items) {
                const product = await this.prisma.product.findUnique({
                    where: { id: itemDto.productId },
                });

                if (!product) {
                    throw new NotFoundException(`Product with ID ${itemDto.productId} not found`);
                }

                if (product.stock < itemDto.quantity) {
                    throw new BadRequestException(`Insufficient stock for ${product.name}`);
                }

                const price = product.price * (1 - product.discount / 100);
                subtotal += price * itemDto.quantity;

                orderItemsData.push({
                    productId: itemDto.productId,
                    quantity: itemDto.quantity,
                    price,
                });
            }
        }

        let discount = 0;
        let couponId: string | null = null;
        let referralDiscount = 0;

        // Apply coupon if provided
        if (createOrderDto.couponCode) {
            const couponResult = await this.validateCoupon(createOrderDto.couponCode, subtotal, orderItemsData);
            discount = couponResult.discount;
            couponId = couponResult.couponId;
        }

        // Check for referral discount (only for registered users)
        if (userId) {
            const referral = await this.prisma.referral.findFirst({
                where: { referredId: userId, status: 'PENDING' },
                include: { referrer: true },
            });

            if (referral) {
                const referralConfig = await this.prisma.referralConfig.findFirst();
                if (referralConfig && subtotal >= referralConfig.minPurchaseAmount) {
                    referralDiscount = Math.min(
                        (subtotal * referralConfig.discountPercentage) / 100,
                        referralConfig.maxDiscountAmount,
                    );

                    // NEW: Calculate and save the rewardAmount for the Referrer
                    if (referralConfig.referrerRewardEnabled) {
                        const rewardAmount = Math.min(
                            (subtotal * referralConfig.referrerRewardPercentage) / 100,
                            referralConfig.maxReferrerRewardAmount
                        );

                        // We will update the referral record later within the main transaction
                        // Wait, we can't update it in the tx unless we add it to the transaction or update it now.
                        // Order is created inside a transaction below. It's safer to update it before the translation since it does not break major consistency, or we can just do it here.

                        if (rewardAmount > 0) {
                            await this.prisma.referral.update({
                                where: { id: referral.id },
                                data: { rewardAmount }
                            });
                        }
                    }
                }
            }
        }

        const total = Math.max(0, subtotal - discount - referralDiscount);
        const taxableAmount = Math.round((total / 1.18) * 100) / 100;
        const tax = Math.round((total - taxableAmount) * 100) / 100;

        // Create order in transaction
        const order = await this.prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
                data: {
                    userId: userId || undefined,
                    orderNumber: this.generateOrderNumber(),
                    status: createOrderDto.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
                    subtotal,
                    taxableAmount,
                    tax,
                    discount,
                    referralDiscount,
                    total,
                    addressId: createOrderDto.addressId,
                    paymentMethod: createOrderDto.paymentMethod,
                    paymentStatus: 'PENDING',
                    couponId,
                    items: {
                        create: orderItemsData,
                    },
                },
                include: {
                    items: {
                        include: { product: true },
                    },
                    address: true,
                    coupon: true,
                },
            });

            // If ONLINE payment, create Razorpay order
            if (createOrderDto.paymentMethod === 'ONLINE') {
                const razorpayOrder = await this.createRazorpayOrder(total, newOrder.id);
                await tx.order.update({
                    where: { id: newOrder.id },
                    data: {
                        razorpayOrderId: razorpayOrder.id,
                    },
                });
            }

            // Update product stock (ONLY for COD orders)
            // For ONLINE orders, we decrement ONLY after payment is verified to prevent "stock leaks"
            if (createOrderDto.paymentMethod === 'COD') {
                for (const item of orderItemsData) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: item.quantity,
                            },
                        },
                    });
                }
            }

            // Increment coupon usage
            if (couponId) {
                await tx.coupon.update({
                    where: { id: couponId },
                    data: { usedCount: { increment: 1 } },
                });
            }

            // Clear cart for registered users
            if (userId && createOrderDto.paymentMethod === 'COD') {
                await tx.cart.deleteMany({ where: { userId } });
            }

            // Re-fetch the updated order to include the razorpayOrderId if it was added
            return tx.order.findUnique({
                where: { id: newOrder.id },
                include: {
                    items: { include: { product: true } },
                    address: true,
                    coupon: true,
                    user: true
                }
            });
        });

        if (order && order.status === 'CONFIRMED') {
            this.mailService.sendOrderConfirmation(order).catch(err =>
                console.error('Initial order confirmation email failed', err)
            );
        }

        return order;
    }

    async createRazorpayOrder(amount: number, receipt: string) {
        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
            currency: 'INR',
            receipt,
        };

        try {
            const order = await this.razorpay.orders.create(options);
            return order;
        } catch (error) {
            console.error('Razorpay Order Creation Error:', error);
            throw new InternalServerErrorException('Failed to create Razorpay order');
        }
    }

    async verifyPayment(
        userId: string | null,
        orderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string,
    ) {
        const where: any = { id: orderId };
        if (userId) {
            where.userId = userId;
        }

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order || (userId && order.userId !== userId)) {
            throw new NotFoundException('Order not found');
        }

        if (!order.razorpayOrderId) {
            throw new BadRequestException('Order does not have a Razorpay order ID');
        }

        const body = order.razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', this.configService.get<string>('RAZORPAY_KEY_SECRET')!)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpaySignature) {
            // Update order status
            await this.prisma.$transaction(async (tx) => {
                const orderWithItems = await tx.order.findUnique({
                    where: { id: orderId },
                    include: { items: true },
                });

                if (!orderWithItems || orderWithItems.status === 'CONFIRMED') return;

                // Decrement stock now that payment is confirmed
                for (const item of orderWithItems.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    });
                }

                await tx.order.update({
                    where: { id: orderId },
                    data: {
                        paymentStatus: 'COMPLETED',
                        razorpayPaymentId,
                        razorpaySignature,
                        status: 'CONFIRMED',
                    },
                });
            });

            // Clear user's cart now that payment is confirmed
            if (userId) {
                await this.prisma.cart.deleteMany({ where: { userId } });
            }

            const updatedOrder = await this.prisma.order.findUnique({
                where: { id: orderId },
                include: { address: true, items: { include: { product: true } }, user: true }
            });

            if (updatedOrder) {
                this.mailService.sendOrderConfirmation(updatedOrder).catch(err =>
                    console.error('Online payment confirmation email failed', err)
                );
            }

            return { status: 'success', message: 'Payment verified successfully' };
        } else {
            // Update payment status as failed and cancel order to restore stock
            await this.prisma.$transaction(async (tx) => {
                const orderWithItems = await tx.order.findUnique({
                    where: { id: orderId },
                    include: { items: true },
                });

                if (orderWithItems && orderWithItems.status !== 'CANCELLED') {
                    // Restore stock ONLY if it was previously deducted (e.g. COD turned online or previous confirmation)
                    if (orderWithItems.status === 'CONFIRMED') {
                        for (const item of orderWithItems.items) {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stock: { increment: item.quantity } },
                            });
                        }
                    }

                    if (orderWithItems.couponId) {
                        await tx.coupon.update({
                            where: { id: orderWithItems.couponId },
                            data: { usedCount: { decrement: 1 } },
                        });
                    }

                    // Update order status
                    await tx.order.update({
                        where: { id: orderId },
                        data: {
                            paymentStatus: 'FAILED',
                            status: 'CANCELLED',
                            razorpayPaymentId,
                            razorpaySignature,
                        },
                    });
                }
            });
            throw new BadRequestException('Invalid signature or payment failed');
        }
    }

    async validateCoupon(code: string, purchaseAmount: number, cartItems?: any[], userId?: string | null) {
        let discount = 0;
        let couponId: string | null = null;
        let isProductSpecific = false;
        let appliedCode: string | null = null;

        if (code && code.trim() !== '') {
            const coupon = await this.prisma.coupon.findUnique({
                where: { code: code.trim().toUpperCase() },
                include: { products: { select: { id: true } } }
            });

            if (!coupon || !coupon.isActive) {
                throw new BadRequestException('Invalid coupon code');
            }

            const now = new Date();
            if (now < coupon.validFrom || now > coupon.validTo) {
                throw new BadRequestException('Coupon has expired or not yet valid');
            }

            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                throw new BadRequestException('Coupon usage limit reached');
            }

            isProductSpecific = coupon.products.length > 0;
            let eligibleAmount = purchaseAmount;
            let eligibleItems: any[] = [];

            if (isProductSpecific) {
                if (!cartItems || cartItems.length === 0) {
                    throw new BadRequestException('This coupon is specific to certain products. Please provide cart items.');
                }

                const couponProductIds = coupon.products.map(p => p.id);
                eligibleItems = cartItems.filter(item => couponProductIds.includes(item.productId));

                if (eligibleItems.length === 0) {
                    throw new BadRequestException('Your cart does not contain any products eligible for this coupon');
                }

                eligibleAmount = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                if (eligibleAmount < coupon.minPurchase) {
                    throw new BadRequestException(`Minimum purchase of ₹${coupon.minPurchase} for eligible products required`);
                }
            } else {
                if (purchaseAmount < coupon.minPurchase) {
                    throw new BadRequestException(`Minimum purchase of ₹${coupon.minPurchase} required`);
                }
            }

            if (coupon.type === 'PERCENTAGE') {
                discount = (eligibleAmount * coupon.value) / 100;
                if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                    discount = coupon.maxDiscount;
                }
            } else {
                discount = Math.min(coupon.value, eligibleAmount);
            }

            couponId = coupon.id;
            appliedCode = coupon.code;
        }

        let referralDiscount = 0;
        if (userId) {
            const referral = await this.prisma.referral.findFirst({
                where: { referredId: userId, status: 'PENDING' },
            });

            if (referral) {
                const referralConfig = await this.prisma.referralConfig.findFirst();
                if (referralConfig && purchaseAmount >= referralConfig.minPurchaseAmount) {
                    referralDiscount = Math.min(
                        (purchaseAmount * referralConfig.discountPercentage) / 100,
                        referralConfig.maxDiscountAmount,
                    );
                }
            }
        }

        return { discount, referralDiscount, couponId, isProductSpecific, code: appliedCode };
    }

    async getUserOrders(userId: string, query: OrderQueryDto) {
        const { status, page = 1, limit = 10 } = query;

        const where: any = { userId, deletedAt: null };
        if (status) {
            where.status = status;
        }

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: { product: true },
                    },
                    address: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data: orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async trackOrder(orderNumber: string, phone: string) {
        if (!orderNumber || !phone) {
            throw new BadRequestException('Order number and phone are required');
        }

        const sanitizedOrderNumber = orderNumber.trim().replace(/^#/, '');

        const order = await this.prisma.order.findFirst({
            where: {
                orderNumber: { equals: sanitizedOrderNumber, mode: 'insensitive' },
                address: {
                    phone: { contains: phone.trim() }
                },
                deletedAt: null,
            },
            include: {
                items: {
                    include: { product: true },
                },
                address: true,
                coupon: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found with provided details');
        }

        return order;
    }

    async getOrderById(id: string, userId?: string | null) {
        const where: any = { id, deletedAt: null };

        const order = await this.prisma.order.findFirst({
            where,
            include: {
                items: {
                    include: { product: true },
                },
                address: true,
                coupon: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // If order belongs to a user, ensure the requesting user is the owner or an admin
        if (order.userId && order.userId !== userId) {
            // If userId is provided as null (guest) but order has a userId, block it
            // If userId is provided as string but doesn't match, block it
            // Admin role check is handled by controller for the admin path
            if (userId !== undefined) {
                throw new BadRequestException('You do not have permission to view this order');
            }
        }

        return order;
    }

    async getAllOrders(query: OrderQueryDto) {
        const { status, page = 1, limit = 10, search } = query;

        const where: any = { deletedAt: null };
        if (status) {
            where.status = status;
        }

        if (search) {
            const searchLower = search.trim();
            where.OR = [
                { id: { contains: searchLower, mode: 'insensitive' } },
                { orderNumber: { contains: searchLower, mode: 'insensitive' } },
                {
                    user: {
                        OR: [
                            { firstName: { contains: searchLower, mode: 'insensitive' } },
                            { lastName: { contains: searchLower, mode: 'insensitive' } },
                            { phone: { contains: searchLower, mode: 'insensitive' } },
                            { email: { contains: searchLower, mode: 'insensitive' } },
                        ],
                    },
                },
                {
                    address: {
                        OR: [
                            { fullName: { contains: searchLower, mode: 'insensitive' } },
                            { phone: { contains: searchLower, mode: 'insensitive' } },
                            { address: { contains: searchLower, mode: 'insensitive' } },
                            { city: { contains: searchLower, mode: 'insensitive' } },
                        ],
                    },
                },
            ];
        }

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: { product: true },
                    },
                    address: true,
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data: orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateOrderStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, adminUserId: string) {
        const order = await this.getOrderById(id);

        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: {
                status: updateOrderStatusDto.status,
                ...(updateOrderStatusDto.status === 'DELIVERED' && {
                    paymentStatus: order.paymentMethod === 'COD' ? 'COMPLETED' : order.paymentStatus,
                }),
            },
            include: {
                items: {
                    include: { product: true },
                },
                address: true,
            },
        });

        if (updateOrderStatusDto.status === 'CONFIRMED') {
            const emailOrder = await this.prisma.order.findUnique({
                where: { id },
                include: { address: true, items: { include: { product: true } }, user: true }
            });
            if (emailOrder) {
                this.mailService.sendOrderConfirmation(emailOrder).catch(err =>
                    console.error('Admin status update email failed', err)
                );
            }
        }

        // Audit log
        await this.prisma.auditLog.create({
            data: {
                userId: adminUserId,
                action: 'UPDATE_ORDER_STATUS',
                entity: 'Order',
                entityId: order.id,
                oldValues: { status: order.status },
                newValues: { status: updateOrderStatusDto.status },
            },
        });

        // Referral Reward Credit for Referrer
        if (updateOrderStatusDto.status === 'DELIVERED' && order.userId) {
            const referral = await this.prisma.referral.findFirst({
                where: {
                    referredId: order.userId,
                    status: 'PENDING',
                    isReferrerRewarded: false
                },
                orderBy: { createdAt: 'desc' }
            });

            if (referral && referral.rewardAmount > 0) {
                await this.prisma.$transaction(async (tx) => {
                    // Credit the referrer
                    await tx.user.update({
                        where: { id: referral.referrerId },
                        data: { rewardBalance: { increment: referral.rewardAmount } }
                    });

                    // Mark referral as rewarded and completed
                    await tx.referral.update({
                        where: { id: referral.id },
                        data: {
                            isReferrerRewarded: true,
                            status: 'COMPLETED',
                            completedAt: new Date()
                        }
                    });
                });
            }
        }

        return updatedOrder;
    }

    async cancelOrder(id: string, userId: string) {
        const order = await this.getOrderById(id, userId);

        if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
            throw new BadRequestException('Cannot cancel order in current status');
        }

        // Restore product stock
        await this.prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { increment: item.quantity },
                    },
                });
            }

            if (order.couponId) {
                await tx.coupon.update({
                    where: { id: order.couponId },
                    data: { usedCount: { decrement: 1 } },
                });
            }

            await tx.order.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });
        });

        return { message: 'Order cancelled successfully' };
    }

    async getReadyToPrint(search?: string) {
        const where: any = {
            status: 'CONFIRMED',
            lastPrintedAt: null,
            deletedAt: null,
        };

        if (search) {
            const searchLower = search.trim();
            where.AND = [
                {
                    OR: [
                        { id: { contains: searchLower, mode: 'insensitive' } },
                        { orderNumber: { contains: searchLower, mode: 'insensitive' } },
                        {
                            user: {
                                OR: [
                                    { firstName: { contains: searchLower, mode: 'insensitive' } },
                                    { lastName: { contains: searchLower, mode: 'insensitive' } },
                                    { phone: { contains: searchLower, mode: 'insensitive' } },
                                    { email: { contains: searchLower, mode: 'insensitive' } },
                                ],
                            },
                        },
                        {
                            address: {
                                OR: [
                                    { fullName: { contains: searchLower, mode: 'insensitive' } },
                                    { phone: { contains: searchLower, mode: 'insensitive' } },
                                    { address: { contains: searchLower, mode: 'insensitive' } },
                                    { city: { contains: searchLower, mode: 'insensitive' } },
                                ],
                            },
                        },
                    ],
                },
            ];
        }

        const orders = await this.prisma.order.findMany({
            where,
            include: {
                items: {
                    include: { product: true },
                },
                address: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        return orders;
    }

    async markAsPrinted(orderIds: string[], adminUserId: string) {
        await this.prisma.order.updateMany({
            where: {
                id: { in: orderIds },
            },
            data: {
                lastPrintedAt: new Date(),
                lastPrintedBy: adminUserId,
            },
        });

        // Create audit log for bulk print action
        await this.prisma.auditLog.create({
            data: {
                userId: adminUserId,
                action: 'BULK_PRINT_ORDERS',
                entity: 'Order',
                entityId: orderIds.join(','),
                newValues: { orderCount: orderIds.length },
            },
        });

        return { message: `Successfully marked ${orderIds.length} orders as printed` };
    }
}
