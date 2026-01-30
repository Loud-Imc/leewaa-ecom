import { IsString, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderDto {
    @IsString()
    addressId: string;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsString()
    couponCode?: string;
}
