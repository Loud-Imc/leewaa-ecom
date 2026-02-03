import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string | null, createAddressDto: CreateAddressDto) {
        // If this is set as default, unset other defaults (only for registered users)
        if (createAddressDto.isDefault && userId) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return this.prisma.address.create({
            data: {
                ...createAddressDto,
                userId: userId || undefined,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }

    async findOne(id: string, userId: string) {
        const address = await this.prisma.address.findFirst({
            where: { id, userId },
        });

        if (!address) {
            throw new NotFoundException('Address not found');
        }

        return address;
    }

    async update(id: string, userId: string, updateAddressDto: UpdateAddressDto) {
        await this.findOne(id, userId);

        // If this is set as default, unset other defaults
        if (updateAddressDto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }

        return this.prisma.address.update({
            where: { id },
            data: updateAddressDto,
        });
    }

    async remove(id: string, userId: string) {
        await this.findOne(id, userId);
        await this.prisma.address.delete({ where: { id } });
        return { message: 'Address deleted successfully' };
    }

    async setDefault(id: string, userId: string) {
        await this.findOne(id, userId);

        await this.prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });

        return this.prisma.address.update({
            where: { id },
            data: { isDefault: true },
        });
    }
}
