import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { PERMISSIONS_KEY } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/constants/permissions.constant';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // SUPER_ADMIN bypasses all permission checks
        if (user.role === UserRole.SUPER_ADMIN) {
            return true;
        }

        // If user has no role entity assigned, they can only be a CUSTOMER or have basic enum role
        // For now, if we are strictly using granular permissions, we should check user.roleEntity.permissions
        // But since the JWT might not have the full roleEntity, we might need to fetch it or ensure it's in the token

        const userPermissions: string[] = user.roleEntity?.permissions || [];

        const hasAllPermissions = requiredPermissions.every((permission) =>
            userPermissions.includes(permission),
        );

        if (!hasAllPermissions) {
            throw new ForbiddenException('You do not have the required permissions to perform this action');
        }

        return true;
    }
}
