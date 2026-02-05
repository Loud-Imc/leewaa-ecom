import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @IsString()
    @IsOptional()
    roleId?: string | null;
}
