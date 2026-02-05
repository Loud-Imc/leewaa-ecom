import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { InvoicesModule } from '../invoices/invoices.module';

@Global()
@Module({
    imports: [InvoicesModule],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
