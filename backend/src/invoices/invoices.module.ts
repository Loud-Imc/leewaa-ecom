import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [OrdersModule, AuthModule],
    controllers: [InvoicesController],
    providers: [InvoicesService],
    exports: [InvoicesService],
})
export class InvoicesModule { }
