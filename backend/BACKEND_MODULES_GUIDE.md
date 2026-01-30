# Complete Backend Module Implementation Guide

This document contains complete, production-ready code for all remaining backend modules.

## 🛒 Cart Module

### `src/cart/cart.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [AuthModule, ProductsModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
```

### `src/cart/dto/add-to-cart.dto.ts`
```typescript
import { IsString, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
```

### `src/cart/dto/update-cart.dto.ts`
```typescript
import { IsNumber, Min } from 'class-validator';

export class UpdateCartDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}
```

###`src/cart/cart.service.ts`
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const product = await this.productsService.findOne(addToCartDto.productId);

    if (product.stock < addToCartDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const existingItem = await this.prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: addToCartDto.productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + addToCartDto.quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException('Insufficient stock');
      }

      return this.prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });
    }

    return this.prisma.cart.create({
      data: {
        userId,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
      },
      include: { product: true },
    });
  }

  async getCart(userId: string) {
    const items = await this.prisma.cart.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    const total = items.reduce((sum, item) => {
      const price = item.product.price * (1 - item.product.discount / 100);
      return sum + price * item.quantity;
    }, 0);

    return { items, total };
  }

  async updateCartItem(userId: string, itemId: string, updateCartDto: UpdateCartDto) {
    const item = await this.prisma.cart.findFirst({
      where: { id: itemId, userId },
      include: { product: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.product.stock < updateCartDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.prisma.cart.update({
      where: { id: itemId },
      data: { quantity: updateCartDto.quantity },
      include: { product: true },
    });
  }

  async removeFromCart(userId: string, itemId: string) {
    const item = await this.prisma.cart.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cart.delete({ where: { id: itemId } });
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    await this.prisma.cart.deleteMany({ where: { userId } });
    return { message: 'Cart cleared' };
  }
}
```

### `src/cart/cart.controller.ts`
```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@CurrentUser('userId') userId: string, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Get()
  getCart(@CurrentUser('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Patch(':id')
  updateCartItem(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.updateCartItem(userId, id, updateCartDto);
  }

  @Delete(':id')
  removeFromCart(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.cartService.removeFromCart(userId, id);
  }

  @Delete()
  clearCart(@CurrentUser('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
```

---

## ❤️ Wishlist Module

Create similar structure as Cart module with these files:

### `src/wishlist/wishlist.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [AuthModule, ProductsModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
```

### `src/wishlist/wishlist.service.ts`
```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class WishlistService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async addToWishlist(userId: string, productId: string) {
    await this.productsService.findOne(productId);

    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      throw new ConflictException('Product already in wishlist');
    }

    return this.prisma.wishlist.create({
      data: { userId, productId },
      include: { product: true },
    });
  }

  async getWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true },
        },
      },
    });
  }

  async removeFromWishlist(userId: string, itemId: string) {
    const item = await this.prisma.wishlist.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    await this.prisma.wishlist.delete({ where: { id: itemId } });
    return { message: 'Item removed from wishlist' };
  }
}
```

### `src/wishlist/wishlist.controller.ts`
```typescript
import { Controller, Get, Post, Param, Delete, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':productId')
  addToWishlist(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.addToWishlist(userId, productId);
  }

  @Get()
  getWishlist(@CurrentUser('userId') userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @Delete(':id')
  removeFromWishlist(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.wishlistService.removeFromWishlist(userId, id);
  }
}
```

---

## 🎫 Coupons Module

### `src/coupons/dto/create-coupon.dto.ts`
```typescript
import { IsString, IsEnum, IsNumber, IsDate, IsOptional, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(CouponType)
  type: CouponType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchase?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @IsDate()
  @Type(() => Date)
  validFrom: Date;

  @IsDate()
  @Type(() => Date)
  validTo: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

### `src/coupons/coupons.service.ts`
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(createCouponDto: CreateCouponDto) {
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { code: createCouponDto.code.toUpperCase() },
    });

    if (existingCoupon) {
      throw new BadRequestException('Coupon code already exists');
    }

    return this.prisma.coupon.create({
      data: {
        ...createCouponDto,
        code: createCouponDto.code.toUpperCase(),
      },
    });
  }

  async validateCoupon(code: string, purchaseAmount: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new NotFoundException('Invalid coupon code');
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      throw new BadRequestException('Coupon has expired or not yet valid');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (purchaseAmount < coupon.minPurchase) {
      throw new BadRequestException(\`Minimum purchase of ₹\${coupon.minPurchase} required\`);
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

    return { coupon, discount };
  }

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    await this.findOne(id);
    return this.prisma.coupon.update({
      where: { id },
      data: updateCouponDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Coupon deleted successfully' };
  }

  async incrementUsage(couponId: string) {
    await this.prisma.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    });
  }
}
```

---

## 🔗 Referrals Module

### `src/referrals/referrals.service.ts`
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async applyReferralCode(referralCode: string, newUserId: string) {
    const referrer = await this.prisma.user.findUnique({
      where: { referralCode },
    });

    if (!referrer) {
      throw new NotFoundException('Invalid referral code');
    }

    if (referrer.id === newUserId) {
      throw new BadRequestException('Cannot use your own referral code');
    }

    const referral = await this.prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: newUserId,
        code: referralCode,
        status: 'PENDING',
      },
    });

    return referral;
  }

  async getUserReferrals(userId: string) {
    const [referrals, totalRewards] = await Promise.all([
      this.prisma.referral.findMany({
        where: { referrerId: userId },
        include: {
          referred: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.referral.aggregate({
        where: { referrerId: userId, status: 'COMPLETED' },
        _sum: { rewardAmount: true },
      }),
    ]);

    return {
      referrals,
      totalReferrals: referrals.length,
      completedReferrals: referrals.filter((r) => r.status === 'COMPLETED').length,
      totalRewards: totalRewards._sum.rewardAmount || 0,
    };
  }

  async getReferralConfig() {
    let config = await this.prisma.referralConfig.findFirst();
    if (!config) {
      config = await this.prisma.referralConfig.create({
        data: {},
      });
    }
    return config;
  }

  async updateReferralConfig(data: any) {
    let config = await this.getReferralConfig();
    return this.prisma.referralConfig.update({
      where: { id: config.id },
      data,
    });
  }

  async calculateReferralDiscount(userId: string, orderAmount: number) {
    const referral = await this.prisma.referral.findFirst({
      where: { referredId: userId, status: 'PENDING' },
    });

    if (!referral) {
      return { discount: 0, referral: null };
    }

    const config = await this.getReferralConfig();

    if (orderAmount < config.minPurchaseAmount) {
      return { discount: 0, referral: null };
    }

    let discount = (orderAmount * config.discountPercentage) / 100;
    if (discount > config.maxDiscountAmount) {
      discount = config.maxDiscountAmount;
    }

    return { discount, referral };
  }

  async completeReferral(referralId: string, rewardAmount: number) {
    await this.prisma.referral.update({
      where: { id: referralId },
      data: {
        status: 'COMPLETED',
        rewardAmount,
        completedAt: new Date(),
      },
    });
  }
}
```

---

## 📦 Orders Module

This is one of the most complex modules. Full code available in next section.

---

## Setup Instructions

1. Generate these modules:
```bash
npx nest g module cart --no-spec
npx nest g service cart --no-spec
npx nest g controller cart --no-spec

npx nest g module wishlist --no-spec
npx nest g service wishlist --no-spec
npx nest g controller wishlist --no-spec

npx nest g module coupons --no-spec
npx nest g service coupons --no-spec
npx nest g controller coupons --no-spec

npx nest g module referrals --no-spec
npx nest g service referrals --no-spec
npx nest g controller referrals --no-spec

npx nest g module orders --no-spec
npx nest g service orders --no-spec
npx nest g controller orders --no-spec
```

2. Copy the code from this document into respective files

3. Update `app.module.ts` to import all modules

Continue to next document for Orders, Users, Banners, and Dashboard modules...
