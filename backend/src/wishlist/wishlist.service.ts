import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
    constructor(private prisma: PrismaService) { }

    async getWishlist(userId: string) {
        return this.prisma.wishlist.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async addToWishlist(userId: string, productId: string) {
        // Check if product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Check if already in wishlist
        const existing = await this.prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (existing) {
            return existing;
        }

        return this.prisma.wishlist.create({
            data: {
                userId,
                productId,
            },
            include: {
                product: true,
            },
        });
    }

    async removeFromWishlist(userId: string, productId: string) {
        return this.prisma.wishlist.delete({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
    }

    async clearWishlist(userId: string) {
        return this.prisma.wishlist.deleteMany({
            where: { userId },
        });
    }
}
