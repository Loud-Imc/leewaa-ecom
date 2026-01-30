import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) { }

    async getCart(userId: string) {
        return this.prisma.cart.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        discount: true,
                        images: true,
                        stock: true,
                    },
                },
            },
        });
    }

    async addToCart(userId: string, addToCartDto: AddToCartDto) {
        const { productId, quantity } = addToCartDto;

        // Check if product exists and is active
        const product = await this.prisma.product.findFirst({
            where: { id: productId, isActive: true, deletedAt: null },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.stock < quantity) {
            throw new BadRequestException('Insufficient stock');
        }

        // Check if item already in cart
        const existingItem = await this.prisma.cart.findUnique({
            where: {
                userId_productId: { userId, productId },
            },
        });

        if (existingItem) {
            return this.prisma.cart.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        }

        return this.prisma.cart.create({
            data: {
                userId,
                productId,
                quantity,
            },
        });
    }

    async updateQuantity(userId: string, id: string, updateCartDto: UpdateCartDto) {
        const cartItem = await this.prisma.cart.findFirst({
            where: { id, userId },
            include: { product: true },
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        if (cartItem.product.stock < updateCartDto.quantity) {
            throw new BadRequestException('Insufficient stock');
        }

        return this.prisma.cart.update({
            where: { id },
            data: { quantity: updateCartDto.quantity },
        });
    }

    async removeItem(userId: string, id: string) {
        const cartItem = await this.prisma.cart.findFirst({
            where: { id, userId },
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        await this.prisma.cart.delete({
            where: { id },
        });

        return { message: 'Item removed from cart' };
    }

    async clearCart(userId: string) {
        await this.prisma.cart.deleteMany({
            where: { userId },
        });

        return { message: 'Cart cleared' };
    }
}
