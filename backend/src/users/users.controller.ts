import { Controller, Get, Patch, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    getProfile(@CurrentUser('userId') userId: string) {
        return this.usersService.getProfile(userId);
    }

    @Patch('profile')
    updateProfile(@CurrentUser('userId') userId: string, @Body() updateProfileDto: UpdateProfileDto) {
        return this.usersService.updateProfile(userId, updateProfileDto);
    }

    @Get('admin/all')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 10;
        return this.usersService.getAllUsers(pageNum, limitNum);
    }

    @Patch('admin/:id/role')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    changeUserRole(
        @Param('id') id: string,
        @Body('role') role: string,
        @CurrentUser('userId') adminUserId: string,
    ) {
        return this.usersService.changeUserRole(id, role, adminUserId);
    }

    @Delete('admin/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    deleteUser(
        @Param('id') id: string,
        @CurrentUser('userId') adminUserId: string,
    ) {
        return this.usersService.deleteUser(id, adminUserId);
    }
}
