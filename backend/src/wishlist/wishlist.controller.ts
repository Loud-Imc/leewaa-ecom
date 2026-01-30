import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) { }

    @Get()
    getWishlist(@CurrentUser('userId') userId: string) {
        return this.wishlistService.getWishlist(userId);
    }

    @Post(':productId')
    addToWishlist(
        @CurrentUser('userId') userId: string,
        @Param('productId') productId: string,
    ) {
        return this.wishlistService.addToWishlist(userId, productId);
    }

    @Delete(':productId')
    removeFromWishlist(
        @CurrentUser('userId') userId: string,
        @Param('productId') productId: string,
    ) {
        return this.wishlistService.removeFromWishlist(userId, productId);
    }

    @Delete()
    clearWishlist(@CurrentUser('userId') userId: string) {
        return this.wishlistService.clearWishlist(userId);
    }
}
