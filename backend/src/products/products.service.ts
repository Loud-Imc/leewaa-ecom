import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProductsService {
    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService,
    ) { }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    async create(createProductDto: CreateProductDto, userId: string, files?: Express.Multer.File[]) {
        // Verify category exists
        const category = await this.prisma.category.findUnique({
            where: { id: createProductDto.categoryId },
        });

        if (!category) {
            throw new BadRequestException('Category not found');
        }

        // Process images if provided
        const uploadedImages: string[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const imageUrl = await this.uploadService.processImage(file);
                uploadedImages.push(imageUrl);
            }
        }

        let slug = this.generateSlug(createProductDto.name);
        const existingSlug = await this.prisma.product.findUnique({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        let finalImages = [...(createProductDto.images || []), ...uploadedImages];

        if (createProductDto.imageOrder && createProductDto.imageOrder.length > 0) {
            finalImages = createProductDto.imageOrder.map((item) => {
                if (item.startsWith('file_')) {
                    const index = parseInt(item.split('_')[1]);
                    return uploadedImages[index] || item;
                }
                return item;
            });
        }

        const { imageOrder, ...productData } = createProductDto;

        const product = await this.prisma.product.create({
            data: {
                ...productData,
                slug,
                images: finalImages,
            },
            include: {
                category: true,
            },
        });

        // Audit log
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'CREATE_PRODUCT',
                entity: 'Product',
                entityId: product.id,
                newValues: product,
            },
        });

        return product;
    }

    async findAll(query: ProductQueryDto) {
        const {
            search,
            categoryId,
            minPrice,
            maxPrice,
            isFeatured,
            sortBy = 'position',
            sortOrder = 'asc',
            page = 1,
            limit = 12,
        } = query;

        const where: any = {
            deletedAt: null,
            isActive: true,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = minPrice;
            if (maxPrice !== undefined) where.price.lte = maxPrice;
        }

        if (isFeatured !== undefined) {
            where.isFeatured = isFeatured;
        }

        // Default sorting logic: prioritize position if not explicitly overriding with another field
        const orderBy: any[] = [];
        if (sortBy === 'position') {
            orderBy.push({ position: sortOrder });
            // Fallback to newest first for same position
            orderBy.push({ createdAt: 'desc' });
        } else {
            orderBy.push({ [sortBy]: sortOrder });
        }

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    category: true,
                },
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findFirst({
            where: { id, deletedAt: null },
            include: {
                category: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async findBySlug(slug: string) {
        const product = await this.prisma.product.findFirst({
            where: { slug, deletedAt: null, isActive: true },
            include: {
                category: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto, userId: string, files?: Express.Multer.File[]) {
        const existingProduct = await this.findOne(id);

        // Process images if provided
        const uploadedImages: string[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const imageUrl = await this.uploadService.processImage(file);
                uploadedImages.push(imageUrl);
            }
        }

        let slug = existingProduct.slug;
        if (updateProductDto.name && updateProductDto.name !== existingProduct.name) {
            slug = this.generateSlug(updateProductDto.name);
            const slugExists = await this.prisma.product.findFirst({
                where: { slug, id: { not: id } },
            });
            if (slugExists) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        let finalImages = [...(updateProductDto.images || []), ...uploadedImages];

        if (updateProductDto.imageOrder && updateProductDto.imageOrder.length > 0) {
            finalImages = updateProductDto.imageOrder.map((item) => {
                if (item.startsWith('file_')) {
                    const index = parseInt(item.split('_')[1]);
                    return uploadedImages[index] || item;
                }
                return item;
            });
        }

        const { imageOrder, ...productData } = updateProductDto;

        const product = await this.prisma.product.update({
            where: { id },
            data: {
                ...productData,
                slug,
                images: finalImages,
            },
            include: {
                category: true,
            },
        });

        // Audit log
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'UPDATE_PRODUCT',
                entity: 'Product',
                entityId: product.id,
                oldValues: existingProduct,
                newValues: product,
            },
        });

        return product;
    }

    async remove(id: string, userId: string) {
        const existingProduct = await this.findOne(id);

        // Soft delete
        const product = await this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        // Audit log
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'DELETE_PRODUCT',
                entity: 'Product',
                entityId: product.id,
                oldValues: existingProduct,
            },
        });

        return { message: 'Product deleted successfully' };
    }
}
