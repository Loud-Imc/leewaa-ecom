import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateBannerDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    image: string;

    @IsOptional()
    @IsString()
    link?: string;

    @IsOptional()
    @IsNumber()
    position?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
