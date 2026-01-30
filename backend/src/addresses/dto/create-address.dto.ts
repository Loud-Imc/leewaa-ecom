import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAddressDto {
    @IsString()
    fullName: string;

    @IsString()
    phone: string;

    @IsString()
    address: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    pincode: string;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
