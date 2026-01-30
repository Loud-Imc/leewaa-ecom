import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    async create(createCategoryDto: CreateCategoryDto) {
        // Verify parent category exists if provided
        if (createCategoryDto.parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: createCategoryDto.parentId },
            });
            if (!parent) {
                throw new BadRequestException('Parent category not found');
            }
        }

        let slug = createCategoryDto.slug || this.generateSlug(createCategoryDto.name);
        const existingSlug = await this.prisma.category.findUnique({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        return this.prisma.category.create({
            data: {
                ...createCategoryDto,
                slug,
            },
            include: {
                parent: true,
                children: true,
            },
        });
    }

    async findAll() {
        return this.prisma.category.findMany({
            where: { isActive: true },
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { position: 'asc' },
        });
    }

    async findTree() {
        const categories = await this.prisma.category.findMany({
            where: { isActive: true, parentId: null },
            include: {
                children: {
                    where: { isActive: true },
                    include: {
                        _count: {
                            select: { products: true },
                        },
                    },
                },
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { position: 'asc' },
        });

        return categories;
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto) {
        await this.findOne(id);

        // Prevent circular reference
        if (updateCategoryDto.parentId && updateCategoryDto.parentId === id) {
            throw new BadRequestException('Category cannot be its own parent');
        }

        let slug = updateCategoryDto.slug;
        if (!slug && updateCategoryDto.name) {
            slug = this.generateSlug(updateCategoryDto.name);
        }

        if (slug) {
            const slugExists = await this.prisma.category.findFirst({
                where: { slug, id: { not: id } },
            });
            if (slugExists) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        return this.prisma.category.update({
            where: { id },
            data: {
                ...updateCategoryDto,
                ...(slug && { slug }),
            },
            include: {
                parent: true,
                children: true,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        // Check if category has products
        const productsCount = await this.prisma.product.count({
            where: { categoryId: id, deletedAt: null },
        });

        if (productsCount > 0) {
            throw new BadRequestException('Cannot delete category with existing products');
        }

        // Check if category has children
        const childrenCount = await this.prisma.category.count({
            where: { parentId: id },
        });

        if (childrenCount > 0) {
            throw new BadRequestException('Cannot delete category with sub-categories');
        }

        await this.prisma.category.delete({ where: { id } });

        return { message: 'Category deleted successfully' };
    }
}
