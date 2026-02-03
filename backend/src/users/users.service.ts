import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    private generateReferralCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    async createUser(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // Generate unique referral code
        let referralCode = this.generateReferralCode();
        let codeExists = await this.prisma.user.findUnique({
            where: { referralCode },
        });
        while (codeExists) {
            referralCode = this.generateReferralCode();
            codeExists = await this.prisma.user.findUnique({
                where: { referralCode },
            });
        }

        return this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
                referralCode,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                roleId: true,
            },
        });
    }

    async updateUser(userId: string, updateDto: CreateUserDto, adminUserId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const data: any = { ...updateDto };
        if (updateDto.password) {
            data.password = await bcrypt.hash(updateDto.password, 10);
        } else {
            delete data.password;
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                roleId: true,
            },
        });

        // Audit log
        await this.prisma.auditLog.create({
            data: {
                userId: adminUserId,
                action: 'UPDATE_USER',
                entity: 'User',
                entityId: userId,
                oldValues: user,
                newValues: updatedUser,
            },
        });

        return updatedUser;
    }

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
                roleId: true,
                roleEntity: {
                    select: {
                        id: true,
                        name: true,
                        permissions: true,
                    },
                },
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
                roleId: true,
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
                    roleId: true,
                    roleEntity: {
                        select: {
                            name: true,
                        },
                    },
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

    async changeUserRole(userId: string, role: string, roleId: string | null, adminUserId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                role: role as any,
                roleId: roleId,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                roleId: true,
            },
        });

        // Audit log
        await this.prisma.auditLog.create({
            data: {
                userId: adminUserId,
                action: 'CHANGE_USER_ROLE',
                entity: 'User',
                entityId: userId,
                oldValues: { role: user.role, roleId: user.roleId },
                newValues: { role, roleId },
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
