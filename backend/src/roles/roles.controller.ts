import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequiredPermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/constants/permissions.constant';
import { Roles as RolesDecorator } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    @RolesDecorator(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @RequiredPermissions(Permission.ROLES_CREATE)
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @Get()
    @RolesDecorator(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @RequiredPermissions(Permission.ROLES_VIEW)
    findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    @RolesDecorator(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @RequiredPermissions(Permission.ROLES_VIEW)
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Patch(':id')
    @RolesDecorator(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @RequiredPermissions(Permission.ROLES_EDIT)
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.rolesService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @RolesDecorator(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @RequiredPermissions(Permission.ROLES_DELETE)
    remove(@Param('id') id: string) {
        return this.rolesService.remove(id);
    }
}
