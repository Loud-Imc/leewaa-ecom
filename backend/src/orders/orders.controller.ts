import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get('validate-coupon')
    validateCoupon(@Query('code') code: string, @Query('subtotal') subtotal: string) {
        return this.ordersService.validateCoupon(code, parseFloat(subtotal));
    }

    @Post()
    create(@CurrentUser('userId') userId: string, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(userId, createOrderDto);
    }

    @Get()
    getUserOrders(@CurrentUser('userId') userId: string, @Query() query: OrderQueryDto) {
        return this.ordersService.getUserOrders(userId, query);
    }

    @Get('admin/all')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    getAllOrders(@Query() query: OrderQueryDto) {
        return this.ordersService.getAllOrders(query);
    }

    @Get(':id')
    getOrderById(@Param('id') id: string, @CurrentUser('userId') userId: string, @CurrentUser('role') role: string) {
        if (role === UserRole.ADMIN) {
            return this.ordersService.getOrderById(id);
        }
        return this.ordersService.getOrderById(id, userId);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    updateOrderStatus(
        @Param('id') id: string,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto,
        @CurrentUser('userId') userId: string,
    ) {
        return this.ordersService.updateOrderStatus(id, updateOrderStatusDto, userId);
    }

    @Patch(':id/cancel')
    cancelOrder(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.ordersService.cancelOrder(id, userId);
    }

    @Post(':id/verify')
    verifyPayment(
        @Param('id') id: string,
        @Body() body: { razorpayPaymentId: string; razorpaySignature: string },
        @CurrentUser('userId') userId: string,
    ) {
        return this.ordersService.verifyPayment(
            userId,
            id,
            body.razorpayPaymentId,
            body.razorpaySignature,
        );
    }
}
