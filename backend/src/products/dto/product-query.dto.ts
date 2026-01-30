import { IsOptional, IsString, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isFeatured?: boolean;

    @IsOptional()
    @IsString()
    sortBy?: string;

    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc';

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    limit?: number = 12;
}
