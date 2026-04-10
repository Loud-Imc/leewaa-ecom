import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequiredPermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/constants/permissions.constant';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
@RequiredPermissions(Permission.REPORTS_VIEW)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('sales')
    getSalesSummary(@Query('period') period: string) {
        return this.reportsService.getSalesSummary(period);
    }

    @Get('customers')
    getCustomerStats() {
        return this.reportsService.getCustomerStats();
    }
}
