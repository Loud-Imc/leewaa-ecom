import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId, deletedAt: null },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                referralCode: true,
                rewardBalance: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
        return this.prisma.user.update({
            where: { id: userId },
            data: updateProfileDto,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                referralCode: true,
                rewardBalance: true,
            },
        });
    }

    async getAllUsers(page: number = 1, limit: number = 10) {
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: { deletedAt: null },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where: { deletedAt: null } }),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async changeUserRole(userId: string, role: string, adminUserId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { role: role as any },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });

        // Audit log
        await this.prisma.auditLog.create({
            data: {
                userId: adminUserId,
                action: 'CHANGE_USER_ROLE',
                entity: 'User',
                entityId: userId,
                oldValues: { role: user.role },
                newValues: { role },
            },
        });

        return updatedUser;
    }

    async deleteUser(userId: string, adminUserId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Soft delete
        await this.prisma.user.update({
            where: { id: userId },
            data: { deletedAt: new Date() },
        });

        // Audit log
        await this.prisma.auditLog.create({
            data: {
                userId: adminUserId,
                action: 'DELETE_USER',
                entity: 'User',
                entityId: userId,
                oldValues: { email: user.email, role: user.role },
                newValues: { deletedAt: new Date() },
            },
        });

        return { message: 'User deleted successfully' };
    }
}
