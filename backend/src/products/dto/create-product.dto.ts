import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsArray, IsJSON } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    categoryId: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    discount?: number;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    stock: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isFeatured?: boolean;

    @IsOptional()
    @IsString()
    metaTitle?: string;

    @IsOptional()
    @IsString()
    metaDescription?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    position?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    imageOrder?: string[];

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        }
        return value;
    })
    features?: any;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').filter(Boolean);
        }
        return value;
    })
    colors?: string[];
}
