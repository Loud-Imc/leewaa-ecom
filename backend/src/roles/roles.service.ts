import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async create(createRoleDto: CreateRoleDto) {
        const existing = await this.prisma.role.findUnique({
            where: { name: createRoleDto.name },
        });

        if (existing) {
            throw new ConflictException('Role already exists');
        }

        return this.prisma.role.create({
            data: createRoleDto,
        });
    }

    async findAll() {
        return this.prisma.role.findMany({
            include: {
                _count: {
                    select: { users: true },
                },
            },
        });
    }

    async findOne(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        return role;
    }

    async update(id: string, updateRoleDto: UpdateRoleDto) {
        const role = await this.findOne(id);

        if (updateRoleDto.name && updateRoleDto.name !== role.name) {
            const existing = await this.prisma.role.findUnique({
                where: { name: updateRoleDto.name },
            });
            if (existing) {
                throw new ConflictException('Role name already exists');
            }
        }

        return this.prisma.role.update({
            where: { id },
            data: updateRoleDto,
        });
    }

    async remove(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: { _count: { select: { users: true } } },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        if (role._count.users > 0) {
            throw new ConflictException('Cannot delete role as it is assigned to users');
        }

        return this.prisma.role.delete({
            where: { id },
        });
    }
}
