import { Controller, Get, Param, Query, Res, NotFoundException } from '@nestjs/common';
import * as express from 'express';
import { InvoicesService } from './invoices.service';
import { OrdersService } from '../orders/orders.service';

@Controller('invoices')
export class InvoicesController {
    constructor(
        private readonly invoicesService: InvoicesService,
        private readonly ordersService: OrdersService,
    ) { }

    @Get(':id')
    async getInvoice(
        @Param('id') id: string,
        @Query('download') download: string,
        @Res() res: express.Response
    ) {
        const order = await this.ordersService.getOrderById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const buffer = await this.invoicesService.generateInvoiceBuffer(order);
        const disposition = download === 'true' ? 'attachment' : 'inline';

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `${disposition}; filename=Invoice-${order.orderNumber}.pdf`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Get('bulk/print')
    async getBulkInvoices(
        @Query('ids') ids: string,
        @Query('download') download: string,
        @Res() res: express.Response
    ) {
        const orderIds = ids.split(',');
        const orders = await Promise.all(
            orderIds.map(id => this.ordersService.getOrderById(id))
        );

        const buffer = await this.invoicesService.generateBulkInvoiceBuffer(orders);
        const disposition = download === 'true' ? 'attachment' : 'inline';

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `${disposition}; filename=Bulk-Invoices.pdf`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }
}
