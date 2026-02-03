import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsEmail, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

class OrderItemDto {
    @IsString()
    productId: string;

    @IsNumber()
    quantity: number;
}

export class CreateOrderDto {
    @IsString()
    addressId: string;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsString()
    couponCode?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items?: OrderItemDto[];

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;
}
