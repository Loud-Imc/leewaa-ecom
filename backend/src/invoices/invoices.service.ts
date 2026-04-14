import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoicesService {
    private readonly mainColor = '#157fb8';
    private readonly bgColor = '#f9fafb';
    private readonly logoPath = path.join(process.cwd(), '..', 'storefront', 'public', 'images', 'Leewa_logo_web.png');

    async generateInvoiceBuffer(order: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                margin: 30,
                size: 'A4',
            });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            this.buildInvoicePage(doc, order);

            doc.end();
        });
    }

    async generateBulkInvoiceBuffer(orders: any[]): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                margin: 30,
                size: 'A4',
            });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            orders.forEach((order, index) => {
                if (index > 0) doc.addPage();
                this.buildInvoicePage(doc, order);
            });

            doc.end();
        });
    }

    private buildInvoicePage(doc: any, order: any) {
        // Logo and Tagline
        if (fs.existsSync(this.logoPath)) {
            doc.image(this.logoPath, 50, 35, { width: 150 });
        }

        doc
            .fillColor('#666666')
            .font('Helvetica')
            .fontSize(8)
            .text('support@leewaa.in | www.leewaa.in', 50, 95);

        // Header
        doc
            .font('Helvetica-Bold')
            .fillColor(this.mainColor)
            .fontSize(24)
            .text('INVOICE', 200, 35, { align: 'right' })
            .fillColor('#000000')
            .fontSize(10)
            .text(`#${order.orderNumber}`, 200, 65, { align: 'right' })
            .font('Helvetica')
            .fillColor('#666666')
            .fontSize(9)
            .text(
                new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                }),
                200,
                80,
                { align: 'right' },
            )
            .fillColor('#444444')
            .fontSize(9)
            .text('GSTIN: 32AAFCL3067L1ZF', 200, 95, { align: 'right' });

        doc.rect(50, 115, 510, 1.5).fill(this.mainColor);

        // Info Cards (Customer & Shipping)
        const cardY = 135;
        const cardHeight = 90;
        const cardWidth = 245;

        // Customer Card
        doc.roundedRect(50, cardY, cardWidth, cardHeight, 6).fill(this.bgColor);

        let customerName = 'Guest User';
        let customerEmail = 'N/A';

        if (order.user) {
            customerName = `${order.user.firstName} ${order.user.lastName}`;
            customerEmail = order.user.email;
        } else if (order.address) {
            customerName = order.address.fullName;
            customerEmail = order.address.email || 'N/A';
        }

        doc
            .fillColor(this.mainColor)
            .font('Helvetica-Bold')
            .fontSize(8)
            .text('CUSTOMER', 65, cardY + 12)
            .fillColor('#000000')
            .fontSize(10)
            .text(customerName, 65, cardY + 28)
            .font('Helvetica')
            .fillColor('#666666')
            .fontSize(9)
            .text(customerEmail, 65, cardY + 42);

        // Shipping Card
        doc.roundedRect(315, cardY, cardWidth, cardHeight, 6).fill(this.bgColor);
        doc
            .fillColor(this.mainColor)
            .font('Helvetica-Bold')
            .fontSize(8)
            .text('SHIPPING TO', 330, cardY + 12)
            .fillColor('#000000')
            .fontSize(10)
            .text(order.address.fullName, 330, cardY + 28)
            .font('Helvetica')
            .fillColor('#444444')
            .fontSize(8)
            .text(order.address.address, 330, cardY + 42, { width: cardWidth - 30 })
            .text(
                `${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
                330,
                doc.y + 1,
            )
            .font('Helvetica-Bold')
            .text(`Phone: ${order.address.phone}`, 330, doc.y + 5);

        // Table Header
        const tableTop = 250;
        doc.rect(50, tableTop, 510, 25).fill(this.mainColor);
        doc
            .font('Helvetica-Bold')
            .fillColor('#ffffff')
            .fontSize(8)
            .text('Item Description', 65, tableTop + 8)
            .text('Qty', 330, tableTop + 8, { width: 30, align: 'center' })
            .text('Unit Price', 380, tableTop + 8, { width: 80, align: 'center' })
            .text('Amount', 480, tableTop + 8, { width: 70, align: 'right' });

        // Table Rows
        let row = tableTop + 35;
        doc.font('Helvetica').fillColor('#000000').fontSize(9);

        order.items.forEach((item: any) => {
            const itemTotal = Math.round(item.price * item.quantity);
            doc
                .font('Helvetica-Bold')
                .text(item.product.name, 65, row)
                .font('Helvetica')
                .text(item.quantity.toString(), 330, row, { width: 30, align: 'center' })
                .text(`Rs. ${Math.round(item.price).toLocaleString('en-IN')}`, 380, row, {
                    width: 80,
                    align: 'center',
                })
                .font('Helvetica-Bold')
                .text(`Rs. ${itemTotal.toLocaleString('en-IN')}`, 480, row, {
                    width: 70,
                    align: 'right',
                });

            row += 18;
            doc.rect(50, row - 4, 510, 0.3).fill('#eeeeee');
            row += 8;
        });

        // Summary
        const summaryX = 350;
        row += 5;
        doc
            .font('Helvetica')
            .fillColor('#666666')
            .fontSize(9)
            .text('Subtotal', summaryX, row)
            .text(`Rs. ${Math.round(order.subtotal).toLocaleString('en-IN')}`, 480, row, { align: 'right' });

        if (order.discount > 0) {
            row += 15;
            doc
                .fillColor('#dc2626')
                .text('Coupon Discount', summaryX, row)
                .text(`-Rs. ${Math.round(order.discount).toLocaleString('en-IN')}`, 480, row, {
                    align: 'right',
                });
        }

        if (order.referralDiscount > 0) {
            row += 15;
            doc
                .fillColor('#4f46e5')
                .text('Referral Benefit', summaryX, row)
                .text(`-Rs. ${Math.round(order.referralDiscount).toLocaleString('en-IN')}`, 480, row, {
                    align: 'right',
                });
        }

        row += 15;
        doc
            .fillColor('#10b981')
            .font('Helvetica-Bold')
            .text('Shipping Fees', summaryX, row)
            .text('FREE', 480, row, { align: 'right' });

        const taxableAmt = order.taxableAmount || order.total / 1.18;
        const taxAmt = order.tax || order.total - taxableAmt;

        row += 15;
        doc
            .font('Helvetica')
            .fillColor('#666666')
            .text('Taxable Amount', summaryX, row)
            .text(`Rs. ${Math.round(taxableAmt).toLocaleString('en-IN')}`, 480, row, {
                align: 'right',
            });

        row += 15;
        doc
            .text('GST (18%)', summaryX, row)
            .text(`Rs. ${Math.round(taxAmt).toLocaleString('en-IN')}`, 480, row, {
                align: 'right',
            });

        row += 12;
        doc.rect(summaryX, row, 210, 1.2).fill(this.mainColor);
        row += 12;

        doc
            .fillColor('#333333')
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('Total Amount', summaryX, row)
            .fillColor(this.mainColor)
            .text(`Rs. ${Math.round(order.total).toLocaleString('en-IN')}`, 480, row, { align: 'right' });

        // Payment Info (Relative to footer)
        const footerY = 750;
        const paymentBoxY = footerY - 80;

        doc.roundedRect(summaryX + 20, paymentBoxY, 190, 40, 6).fill('#f0f9ff');
        doc
            .fillColor('#444444')
            .fontSize(8)
            .text(`Payment Method: ${order.paymentMethod}`, summaryX + 45, paymentBoxY + 10)
            .text('Status: ', { continued: true })
            .fillColor(order.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b')
            .font('Helvetica-Bold')
            .text(order.paymentStatus);

        // Footer
        doc
            .fillColor(this.mainColor)
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('Thank you for choosing LEEWAA!', 50, footerY, { align: 'center' })
            .fillColor('#999999')
            .font('Helvetica')
            .fontSize(8)
            .text('For support, contact us at hello@leewaa.in or visit www.leewaa.in', 50, footerY + 15, {
                align: 'center',
            });
    }
}
