import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const header = request.headers.authorization;

        if (!header) {
            return true;
        }

        try {
            return (await super.canActivate(context)) as boolean;
        } catch (error) {
            return true;
        }
    }

    handleRequest(err, user, info) {
        return user || null;
    }
}
