import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequiredPermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/constants/permissions.constant';

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

    @Post('admin/create')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.usersService.createUser(createUserDto);
    }

    @Patch('admin/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateAdminUserDto,
        @CurrentUser('userId') adminUserId: string,
    ) {
        console.log(`🚀 [UsersController] Patching user ${id} with:`, updateUserDto);
        return this.usersService.updateUser(id, updateUserDto, adminUserId);
    }

    @Get('admin/all')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 10;
        return this.usersService.getAllUsers(pageNum, limitNum);
    }

    @Get('admin/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    getUserById(@Param('id') id: string) {
        return this.usersService.getProfile(id);
    }

    @Patch('admin/:id/role')
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @RequiredPermissions(Permission.USERS_MANAGE_ROLES)
    changeUserRole(
        @Param('id') id: string,
        @Body('role') role: string,
        @Body('roleId') roleId: string,
        @CurrentUser('userId') adminUserId: string,
    ) {
        return this.usersService.changeUserRole(id, role, roleId, adminUserId);
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
