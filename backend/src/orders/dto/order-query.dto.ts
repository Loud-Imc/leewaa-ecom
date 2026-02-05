import { IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class OrderQueryDto {
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    search?: string;
}
