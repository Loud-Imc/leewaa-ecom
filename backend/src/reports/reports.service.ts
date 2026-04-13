import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getSalesSummary(period: string) {
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'DAILY':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'WEEKLY':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'MONTHLY':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'YEARLY':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1); // Default to monthly
        }

        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: { gte: startDate },
                status: { not: 'CANCELLED' },
                deletedAt: null,
            },
            select: {
                total: true,
                tax: true,
                taxableAmount: true,
                createdAt: true,
                paymentMethod: true,
            }
        });

        const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
        const totalTaxable = orders.reduce((sum, order) => sum + (order.taxableAmount || 0), 0);
        const totalTax = orders.reduce((sum, order) => sum + (order.tax || 0), 0);
        const orderCount = orders.length;
        const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

        // Payment method breakdown
        const paymentStats = orders.reduce((acc, order) => {
            acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.total;
            return acc;
        }, {} as Record<string, number>);

        return {
            period,
            totalSales,
            totalTaxable,
            totalTax,
            orderCount,
            avgOrderValue,
            paymentStats,
            startDate,
            endDate: now
        };
    }

    async getCustomerStats() {
        const totalCustomers = await this.prisma.user.count({
            where: { role: UserRole.CUSTOMER, deletedAt: null }
        });

        const activeCustomers = await this.prisma.user.count({
            where: {
                role: UserRole.CUSTOMER,
                deletedAt: null,
                orders: { some: { status: 'DELIVERED' } }
            }
        });

        const topCustomers = await this.prisma.user.findMany({
            where: { role: UserRole.CUSTOMER, deletedAt: null },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                _count: { select: { orders: true } },
                orders: {
                    where: { status: 'DELIVERED' },
                    select: { total: true }
                }
            },
            take: 5
        });

        const formattedTopCustomers = topCustomers.map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            orderCount: user._count.orders,
            totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0)
        })).sort((a, b) => b.totalSpent - a.totalSpent);

        return {
            totalCustomers,
            activeCustomers,
            topCustomers: formattedTopCustomers
        };
    }
}
