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
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequiredPermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/constants/permissions.constant';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get('track')
    trackOrder(@Query('orderNumber') orderNumber: string, @Query('phone') phone: string) {
        return this.ordersService.trackOrder(orderNumber, phone);
    }

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
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @RequiredPermissions(Permission.ORDERS_VIEW)
    getAllOrders(@Query() query: OrderQueryDto) {
        return this.ordersService.getAllOrders(query);
    }

    @Get('admin/ready-to-print')
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @RequiredPermissions(Permission.ORDERS_PRINT)
    getReadyToPrint(@Query('search') search?: string) {
        return this.ordersService.getReadyToPrint(search);
    }

    @Post('admin/mark-printed')
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @RequiredPermissions(Permission.ORDERS_PRINT)
    markAsPrinted(@Body() dto: MarkPrintedDto, @CurrentUser('userId') userId: string) {
        return this.ordersService.markAsPrinted(dto.orderIds, userId);
    }

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    getOrderById(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string | null,
        @CurrentUser('role') role: string,
        @CurrentUser('roleEntity') roleEntity?: any,
    ) {
        // Administrative roles can view any order, provided they have ORDERS_VIEW permission or are SUPER_ADMIN/ADMIN
        const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF];
        if (role && adminRoles.includes(role as any)) {
            // Check implicit permission here since we bypass guard
            const hasPermission = role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN || (roleEntity?.permissions?.includes(Permission.ORDERS_VIEW));
            if (hasPermission) {
                return this.ordersService.getOrderById(id);
            }
        }
        return this.ordersService.getOrderById(id, userId);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @RequiredPermissions(Permission.ORDERS_UPDATE_STATUS)
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
        return this.ordersService.cancelOrder(id, userId); // Let service verify ownership
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
