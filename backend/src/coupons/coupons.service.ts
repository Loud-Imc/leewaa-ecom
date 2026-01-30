import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
    constructor(private prisma: PrismaService) { }

    async create(createCouponDto: CreateCouponDto) {
        const existingCode = await this.prisma.coupon.findUnique({
            where: { code: createCouponDto.code.toUpperCase() },
        });

        if (existingCode) {
            throw new ConflictException('Coupon code already exists');
        }

        return this.prisma.coupon.create({
            data: {
                ...createCouponDto,
                code: createCouponDto.code.toUpperCase(),
                validFrom: new Date(createCouponDto.validFrom),
                validTo: new Date(createCouponDto.validTo),
            },
        });
    }

    async findAll() {
        return this.prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        return coupon;
    }

    async update(id: string, updateCouponDto: UpdateCouponDto) {
        const coupon = await this.findOne(id);

        return this.prisma.coupon.update({
            where: { id },
            data: {
                ...updateCouponDto,
                ...(updateCouponDto.code && { code: updateCouponDto.code.toUpperCase() }),
                ...(updateCouponDto.validFrom && { validFrom: new Date(updateCouponDto.validFrom) }),
                ...(updateCouponDto.validTo && { validTo: new Date(updateCouponDto.validTo) }),
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.coupon.delete({ where: { id } });
    }
}
