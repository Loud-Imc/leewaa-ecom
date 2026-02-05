import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { UploadModule } from './upload/upload.module';
import { OrdersModule } from './orders/orders.module';
import { AddressesModule } from './addresses/addresses.module';
import { UsersModule } from './users/users.module';
import { BannersModule } from './banners/banners.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CouponsModule } from './coupons/coupons.module';
import { ReportsModule } from './reports/reports.module';
import { RolesModule } from './roles/roles.module';
import { MailModule } from './mail/mail.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    UploadModule,
    OrdersModule,
    AddressesModule,
    UsersModule,
    BannersModule,
    DashboardModule,
    CartModule,
    WishlistModule,
    CouponsModule,
    ReportsModule,
    RolesModule,
    MailModule,
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
