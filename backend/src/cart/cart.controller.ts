import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    getCart(@CurrentUser('userId') userId: string) {
        return this.cartService.getCart(userId);
    }

    @Post()
    addToCart(@CurrentUser('userId') userId: string, @Body() addToCartDto: AddToCartDto) {
        return this.cartService.addToCart(userId, addToCartDto);
    }

    @Patch(':id')
    updateQuantity(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Body() updateCartDto: UpdateCartDto,
    ) {
        return this.cartService.updateQuantity(userId, id, updateCartDto);
    }

    @Delete(':id')
    removeItem(@CurrentUser('userId') userId: string, @Param('id') id: string) {
        return this.cartService.removeItem(userId, id);
    }

    @Delete()
    clearCart(@CurrentUser('userId') userId: string) {
        return this.cartService.clearCart(userId);
    }
}
