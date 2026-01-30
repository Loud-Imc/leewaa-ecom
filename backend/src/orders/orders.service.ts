import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');

@Injectable()
export class OrdersService {
    private razorpay: any;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
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

    async create(userId: string, createOrderDto: CreateOrderDto) {
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
            throw new NotFoundException('Address not found');
        }

        // Calculate subtotal
        let subtotal = 0;
        const orderItems = cartItems.map((item) => {
            const price = item.product.price * (1 - item.product.discount / 100);
            subtotal += price * item.quantity;

            // Verify stock
            if (item.product.stock < item.quantity) {
                throw new BadRequestException(`Insufficient stock for ${item.product.name}`);
            }

            return {
                productId: item.productId,
                quantity: item.quantity,
                price,
            };
        });

        let discount = 0;
        let couponId: string | null = null;
        let referralDiscount = 0;

        // Apply coupon if provided
        if (createOrderDto.couponCode) {
            const couponResult = await this.validateCoupon(createOrderDto.couponCode, subtotal);
            discount = couponResult.discount;
            couponId = couponResult.couponId;
        }

        // Check for referral discount
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
            }
        }

        const total = subtotal - discount - referralDiscount;

        // Create order in transaction
        const order = await this.prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    orderNumber: this.generateOrderNumber(),
                    status: 'PENDING',
                    subtotal,
                    discount,
                    referralDiscount,
                    total,
                    addressId: createOrderDto.addressId,
                    paymentMethod: createOrderDto.paymentMethod,
                    paymentStatus: 'PENDING',
                    couponId,
                    items: {
                        create: orderItems,
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

            // If ONLINE payment, create Razorpay order and update DB order
            if (createOrderDto.paymentMethod === 'ONLINE') {
                const razorpayOrder = await this.createRazorpayOrder(total, newOrder.id);
                const updatedOrder = await tx.order.update({
                    where: { id: newOrder.id },
                    data: {
                        razorpayOrderId: razorpayOrder.id,
                    },
                    include: {
                        items: {
                            include: { product: true },
                        },
                        address: true,
                        coupon: true,
                    },
                });

                // Return from transaction early if online
                // Wait, we still need to clear cart and update stock after payment?
                // Actually, we usually clear cart and reserve stock immediately.
                // If payment fails, we can restore it (or just leave it cancelled).
            }

            // Update product stock
            for (const item of cartItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            // Increment coupon usage
            if (couponId) {
                await tx.coupon.update({
                    where: { id: couponId },
                    data: { usedCount: { increment: 1 } },
                });
            }

            // Clear cart based on payment method
            // For COD, clear immediately. For Online, clear after payment verification
            if (createOrderDto.paymentMethod === 'COD') {
                await tx.cart.deleteMany({ where: { userId } });
            }


            // If it was already updated for Razorpay, retrieve the latest version
            if (createOrderDto.paymentMethod === 'ONLINE') {
                return tx.order.findUnique({
                    where: { id: newOrder.id },
                    include: {
                        items: { include: { product: true } },
                        address: true,
                        coupon: true
                    }
                });
            }

            return newOrder;
        });

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
        userId: string,
        orderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string,
    ) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId, userId },
        });

        if (!order) {
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
            await this.prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentStatus: 'COMPLETED',
                    razorpayPaymentId,
                    razorpaySignature,
                    status: 'CONFIRMED',
                },
            });

            // Clear user's cart now that payment is confirmed
            await this.prisma.cart.deleteMany({ where: { userId } });

            return { status: 'success', message: 'Payment verified successfully' };
        } else {
            // Update payment status as failed and cancel order to restore stock
            await this.prisma.$transaction(async (tx) => {
                const orderWithItems = await tx.order.findUnique({
                    where: { id: orderId },
                    include: { items: true },
                });

                if (orderWithItems && orderWithItems.status !== 'CANCELLED') {
                    // Restore stock
                    for (const item of orderWithItems.items) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { increment: item.quantity } },
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

    async validateCoupon(code: string, purchaseAmount: number) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
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

        if (purchaseAmount < coupon.minPurchase) {
            throw new BadRequestException(`Minimum purchase of ₹${coupon.minPurchase} required`);
        }

        let discount = 0;
        if (coupon.type === 'PERCENTAGE') {
            discount = (purchaseAmount * coupon.value) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.value;
        }

        return { discount, couponId: coupon.id };
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

    async getOrderById(id: string, userId?: string) {
        const where: any = { id, deletedAt: null };
        if (userId) {
            where.userId = userId;
        }

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

        return order;
    }

    async getAllOrders(query: OrderQueryDto) {
        const { status, page = 1, limit = 10 } = query;

        const where: any = { deletedAt: null };
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
        if (updateOrderStatusDto.status === 'DELIVERED') {
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

            await tx.order.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });
        });

        return { message: 'Order cancelled successfully' };
    }
}
