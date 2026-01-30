import { IsString, IsEnum, IsNumber, IsDateString, IsOptional, IsBoolean, Min } from 'class-validator';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
    @IsString()
    code: string;

    @IsEnum(CouponType)
    type: CouponType;

    @IsNumber()
    @Min(0)
    value: number;

    @IsNumber()
    @Min(0)
    minPurchase: number;

    @IsNumber()
    @IsOptional()
    maxDiscount?: number;

    @IsDateString()
    validFrom: string;

    @IsDateString()
    validTo: string;

    @IsNumber()
    @IsOptional()
    @Min(1)
    usageLimit?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
