import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequiredPermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/constants/permissions.constant';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @RequiredPermissions(Permission.PRODUCTS_CREATE)
    @UseInterceptors(FilesInterceptor('files'))
    create(
        @Body() createProductDto: CreateProductDto,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser('userId') userId: string,
    ) {
        return this.productsService.create(createProductDto, userId, files);
    }

    @Get()
    findAll(@Query() query: ProductQueryDto) {
        return this.productsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Get('slug/:slug')
    findBySlug(@Param('slug') slug: string) {
        return this.productsService.findBySlug(slug);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @RequiredPermissions(Permission.PRODUCTS_EDIT)
    @UseInterceptors(FilesInterceptor('files'))
    update(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser('userId') userId: string,
    ) {
        return this.productsService.update(id, updateProductDto, userId, files);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
    @RequiredPermissions(Permission.PRODUCTS_DELETE)
    remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.productsService.remove(id, userId);
    }
}
