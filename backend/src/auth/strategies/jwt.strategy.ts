import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                roleId: true,
                roleEntity: {
                    select: {
                        id: true,
                        name: true,
                        permissions: true,
                    },
                },
                deletedAt: true,
            },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedException();
        }

        return {
            userId: user.id,
            email: user.email,
            role: user.role,
            roleId: user.roleId,
            roleEntity: user.roleEntity,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }
}
