import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [
            totalRevenue,
            totalOrders,
            totalCustomers,
            pendingOrders,
            recentOrders,
            topProducts,
            orderStatusBreakdown,
        ] = await Promise.all([
            this.getTotalRevenue(),
            this.prisma.order.count({ where: { deletedAt: null } }),
            this.prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
            this.prisma.order.count({ where: { status: 'PENDING', deletedAt: null } }),
            this.getRecentOrders(),
            this.getTopProducts(),
            this.getOrderStatusBreakdown(),
        ]);

        return {
            totalRevenue,
            totalOrders,
            totalCustomers,
            pendingOrders,
            recentOrders,
            topProducts,
            orderStatusBreakdown,
        };
    }

    private async getTotalRevenue() {
        const result = await this.prisma.order.aggregate({
            where: {
                deletedAt: null,
                status: { in: ['DELIVERED', 'SHIPPED', 'PROCESSING', 'CONFIRMED'] },
            },
            _sum: { total: true },
        });
        return result._sum.total || 0;
    }

    private async getRecentOrders() {
        return this.prisma.order.findMany({
            where: { deletedAt: null },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
    }

    private async getTopProducts() {
        const orderItems = await this.prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            _count: { id: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 10,
        });

        const products = await this.prisma.product.findMany({
            where: {
                id: { in: orderItems.map((item) => item.productId) },
            },
            select: {
                id: true,
                name: true,
                price: true,
                images: true,
            },
        });

        return orderItems.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return {
                product,
                totalSold: item._sum.quantity,
                orderCount: item._count.id,
            };
        });
    }

    private async getOrderStatusBreakdown() {
        const orders = await this.prisma.order.groupBy({
            by: ['status'],
            where: { deletedAt: null },
            _count: { id: true },
        });

        return orders.map((item) => ({
            status: item.status,
            count: item._count.id,
        }));
    }
}
