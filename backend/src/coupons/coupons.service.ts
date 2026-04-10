import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
    constructor(private prisma: PrismaService) { }

    async create(createCouponDto: CreateCouponDto) {
        const existingCode = await this.prisma.coupon.findUnique({
            where: { code: createCouponDto.code.toUpperCase() },
        });

        if (existingCode) {
            throw new ConflictException('Coupon code already exists');
        }

        const { productIds, ...couponData } = createCouponDto;

        return this.prisma.coupon.create({
            data: {
                ...couponData,
                code: createCouponDto.code.toUpperCase(),
                validFrom: new Date(createCouponDto.validFrom),
                validTo: new Date(createCouponDto.validTo),
                ...(productIds && productIds.length > 0 && {
                    products: {
                        connect: productIds.map(id => ({ id }))
                    }
                })
            },
            include: { products: true }
        });
    }

    async findAll() {
        return this.prisma.coupon.findMany({
            include: { products: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { id },
            include: { products: true }
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        return coupon;
    }

    async update(id: string, updateCouponDto: UpdateCouponDto) {
        const coupon = await this.findOne(id);
        const { productIds, ...updateData } = updateCouponDto;

        return this.prisma.coupon.update({
            where: { id },
            data: {
                ...updateData,
                ...(updateData.code && { code: updateData.code.toUpperCase() }),
                ...(updateData.validFrom && { validFrom: new Date(updateData.validFrom) }),
                ...(updateData.validTo && { validTo: new Date(updateData.validTo) }),
                ...(productIds && {
                    products: {
                        set: productIds.map(id => ({ id }))
                    }
                })
            },
            include: { products: true }
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.coupon.delete({ where: { id } });
    }

    async getUsage(id: string) {
        const coupon = await this.findOne(id);

        const orders = await this.prisma.order.findMany({
            where: {
                couponId: id,
                status: {
                    notIn: ['CANCELLED', 'REFUNDED']
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const productSales = new Map<string, any>();
        let totalDiscountProvided = 0;
        let totalRevenueGenerated = 0;

        orders.forEach(order => {
            totalDiscountProvided += order.discount;
            totalRevenueGenerated += order.total;

            order.items.forEach(item => {
                const prodId = item.productId;
                if (!productSales.has(prodId)) {
                    productSales.set(prodId, {
                        product: item.product,
                        unitsSold: 0,
                        revenue: 0
                    });
                }
                const stats = productSales.get(prodId);
                stats.unitsSold += item.quantity;
                stats.revenue += (item.quantity * item.price);
            });
        });

        return {
            coupon,
            totalOrders: orders.length,
            totalDiscountProvided,
            totalRevenueGenerated,
            productInsights: Array.from(productSales.values()).sort((a, b) => b.unitsSold - a.unitsSold),
            recentOrders: orders.slice(0, 10).map(o => ({
                id: o.id,
                orderNumber: o.orderNumber,
                total: o.total,
                discount: o.discount,
                status: o.status,
                createdAt: o.createdAt,
                customer: o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Guest'
            }))
        };
    }
}
