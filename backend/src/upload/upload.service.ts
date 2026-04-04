import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import * as path from 'path';
import sharp from 'sharp';
import { promisify } from 'util';
import * as fs from 'fs';

const { join, extname } = path;

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class UploadService {
    constructor(private configService: ConfigService) { }

    getMulterOptions() {
        return {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
                if (allowedMimes.includes(file.mimetype)) {
                    callback(null, true);
                } else {
                    callback(new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP are allowed'), false);
                }
            },
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB
            },
        };
    }

    async processImage(file: Express.Multer.File): Promise<string> {
        const rootDir = path.resolve(process.cwd());
        const uploadDir = path.join(rootDir, 'uploads');

        // Ensure upload directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
        const outputPath = path.join(uploadDir, filename);

        try {
            // Read file into buffer to avoid EBUSY lock on Windows
            const absoluteFilePath = path.resolve(file.path);
            const buffer = fs.readFileSync(absoluteFilePath);

            // Compress and convert to WebP
            await sharp(buffer)
                .resize(1200, 1200, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .webp({ quality: 85 })
                .toFile(outputPath);

            // Delete original file
            if (fs.existsSync(absoluteFilePath)) {
                await unlinkAsync(absoluteFilePath);
            }

            // Return URL (ensure forward slashes for URLs)
            return `/uploads/${filename}`;
        } catch (error) {
            console.error('Error in processImage:', error);
            // Clean up files on error
            if (file.path && fs.existsSync(path.resolve(file.path))) {
                try { await unlinkAsync(path.resolve(file.path)); } catch (e) { }
            }
            if (outputPath && fs.existsSync(outputPath)) {
                try { await unlinkAsync(outputPath); } catch (e) { }
            }
            throw new BadRequestException('Error processing image');
        }
    }

    async deleteImage(url: string): Promise<void> {
        const uploadPath = this.configService.get('UPLOAD_PATH') || './uploads';
        const filename = url.replace('/uploads/', '');
        const filePath = join(uploadPath, filename);

        if (fs.existsSync(filePath)) {
            await unlinkAsync(filePath);
        }
    }
}
