import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequiredPermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/constants/permissions.constant';

@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
export class CouponsController {
    constructor(private readonly couponsService: CouponsService) { }

    @Post()
    @RequiredPermissions(Permission.COUPONS_CREATE)
    create(@Body() createCouponDto: CreateCouponDto) {
        return this.couponsService.create(createCouponDto);
    }

    @Get()
    @RequiredPermissions(Permission.COUPONS_VIEW)
    findAll() {
        return this.couponsService.findAll();
    }

    @Get(':id/usage')
    @RequiredPermissions(Permission.COUPONS_VIEW)
    getUsage(@Param('id') id: string) {
        return this.couponsService.getUsage(id);
    }

    @Get(':id')
    @RequiredPermissions(Permission.COUPONS_VIEW)
    findOne(@Param('id') id: string) {
        return this.couponsService.findOne(id);
    }

    @Patch(':id')
    @RequiredPermissions(Permission.COUPONS_EDIT)
    update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
        return this.couponsService.update(id, updateCouponDto);
    }

    @Delete(':id')
    @RequiredPermissions(Permission.COUPONS_DELETE)
    remove(@Param('id') id: string) {
        return this.couponsService.remove(id);
    }
}
