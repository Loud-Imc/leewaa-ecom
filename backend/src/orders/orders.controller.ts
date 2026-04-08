import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { MarkPrintedDto } from './dto/mark-printed.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post('validate-coupon')
    @UseGuards(OptionalJwtAuthGuard)
    validateCoupon(
        @CurrentUser('userId') userId: string | null,
        @Body() body: { code: string; subtotal: number; cartItems?: any[] }
    ) {
        return this.ordersService.validateCoupon(body.code, body.subtotal, body.cartItems, userId);
    }

    @Post()
    @UseGuards(OptionalJwtAuthGuard)
    create(@CurrentUser('userId') userId: string | null, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(userId, createOrderDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getUserOrders(@CurrentUser('userId') userId: string, @Query() query: OrderQueryDto) {
        return this.ordersService.getUserOrders(userId, query);
    }

    @Get('admin/all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    getAllOrders(@Query() query: OrderQueryDto) {
        return this.ordersService.getAllOrders(query);
    }

    @Get('admin/ready-to-print')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    getReadyToPrint(@Query('search') search?: string) {
        return this.ordersService.getReadyToPrint(search);
    }

    @Post('admin/mark-printed')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    markAsPrinted(@Body() dto: MarkPrintedDto, @CurrentUser('userId') userId: string) {
        return this.ordersService.markAsPrinted(dto.orderIds, userId);
    }

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    getOrderById(@Param('id') id: string, @CurrentUser('userId') userId: string | null, @CurrentUser('role') role: string) {
        // Administrative roles can view any order
        const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.STAFF];
        if (role && adminRoles.includes(role as any)) {
            return this.ordersService.getOrderById(id);
        }
        return this.ordersService.getOrderById(id, userId);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    updateOrderStatus(
        @Param('id') id: string,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto,
        @CurrentUser('userId') userId: string,
    ) {
        return this.ordersService.updateOrderStatus(id, updateOrderStatusDto, userId);
    }

    @Patch(':id/cancel')
    @UseGuards(JwtAuthGuard)
    cancelOrder(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.ordersService.cancelOrder(id, userId);
    }

    @Post(':id/verify')
    @UseGuards(OptionalJwtAuthGuard)
    verifyPayment(
        @Param('id') id: string,
        @Body() body: { razorpayPaymentId: string; razorpaySignature: string },
        @CurrentUser('userId') userId: string | null,
    ) {
        return this.ordersService.verifyPayment(
            userId,
            id,
            body.razorpayPaymentId,
            body.razorpaySignature,
        );
    }
}
