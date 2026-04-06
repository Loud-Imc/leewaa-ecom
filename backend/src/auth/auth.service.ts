import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    // Generate unique referral code
    private generateReferralCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    async register(registerDto: RegisterDto) {
        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Check phone uniqueness if provided
        if (registerDto.phone) {
            const existingPhone = await this.prisma.user.findUnique({
                where: { phone: registerDto.phone },
            });
            if (existingPhone) {
                throw new ConflictException('User with this phone number already exists');
            }
        }

        // Validate referral code if provided
        let referrer: { id: string } | null = null;
        if (registerDto.referralCode) {
            const found = await this.prisma.user.findUnique({
                where: { referralCode: registerDto.referralCode },
                select: { id: true },
            });
            if (!found) {
                throw new BadRequestException('Invalid referral code');
            }
            referrer = found;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Generate unique referral code
        let referralCode = this.generateReferralCode();
        let codeExists = await this.prisma.user.findUnique({
            where: { referralCode },
        });
        while (codeExists) {
            referralCode = this.generateReferralCode();
            codeExists = await this.prisma.user.findUnique({
                where: { referralCode },
            });
        }

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                phone: registerDto.phone,
                referralCode,
                referredBy: referrer?.id,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                referralCode: true,
                createdAt: true,
            },
        });

        // Create referral record if referred
        if (referrer && registerDto.referralCode) {
            await this.prisma.referral.create({
                data: {
                    referrerId: referrer.id,
                    referredId: user.id,
                    code: registerDto.referralCode,
                    status: 'PENDING',
                },
            });
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Save refresh token
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        // Fetch role entity for the response
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                roleEntity: {
                    select: {
                        id: true,
                        name: true,
                        permissions: true,
                    },
                },
            },
        });

        return {
            user: {
                ...user,
                roleEntity: userWithRole?.roleEntity,
            },
            ...tokens,
        };
    }

    async login(loginDto: LoginDto) {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Save refresh token
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        // Fetch role entity for the response
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                roleEntity: {
                    select: {
                        id: true,
                        name: true,
                        permissions: true,
                    },
                },
            },
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                roleEntity: userWithRole?.roleEntity,
                referralCode: user.referralCode,
                rewardBalance: user.rewardBalance,
            },
            ...tokens,
        };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        if (!userId) {
            throw new UnauthorizedException('Access denied');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.refreshToken || user.deletedAt) {
            throw new UnauthorizedException('Access denied');
        }

        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isRefreshTokenValid) {
            throw new UnauthorizedException('Access denied');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async logout(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
        return { message: 'Logged out successfully' };
    }

    private async generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    private async updateRefreshToken(userId: string, refreshToken: string) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hashedRefreshToken },
        });
    }
}
