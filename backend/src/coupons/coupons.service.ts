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

        const { productIds, ...couponData } = createCouponDto;

        return this.prisma.coupon.create({
            data: {
                ...couponData,
                code: createCouponDto.code.toUpperCase(),
                validFrom: new Date(createCouponDto.validFrom),
                validTo: new Date(createCouponDto.validTo),
                ...(productIds && productIds.length > 0 && {
                    products: {
                        connect: productIds.map(id => ({ id }))
                    }
                })
            },
            include: { products: true }
        });
    }

    async findAll() {
        return this.prisma.coupon.findMany({
            include: { products: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { id },
            include: { products: true }
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        return coupon;
    }

    async update(id: string, updateCouponDto: UpdateCouponDto) {
        const coupon = await this.findOne(id);
        const { productIds, ...updateData } = updateCouponDto;

        return this.prisma.coupon.update({
            where: { id },
            data: {
                ...updateData,
                ...(updateData.code && { code: updateData.code.toUpperCase() }),
                ...(updateData.validFrom && { validFrom: new Date(updateData.validFrom) }),
                ...(updateData.validTo && { validTo: new Date(updateData.validTo) }),
                ...(productIds && {
                    products: {
                        set: productIds.map(id => ({ id }))
                    }
                })
            },
            include: { products: true }
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.coupon.delete({ where: { id } });
    }
}
