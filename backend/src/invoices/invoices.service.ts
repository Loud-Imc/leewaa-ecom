import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to convert number to words (Indian numbering system)
function amountToWords(num: number): string {
    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    const convertLessThanOneThousand = (n: number): string => {
        let temp = '';
        if (n >= 100) {
            temp += a[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 20) {
            temp += b[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n > 0) {
            temp += a[n] + ' ';
        }
        return temp.trim();
    };

    let words = '';
    
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const remaining = num;

    if (crore > 0) {
        words += convertLessThanOneThousand(crore) + ' Crore ';
    }
    if (lakh > 0) {
        words += convertLessThanOneThousand(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
        words += convertLessThanOneThousand(thousand) + ' Thousand ';
    }
    if (remaining > 0) {
        words += convertLessThanOneThousand(remaining);
    }

    return words.trim() + ' Rupees Only';
}

@Injectable()
export class InvoicesService {
    private readonly mainColor = '#2a6582'; // Muted Teal/Blue color matching the PDF template
    private readonly gridColor = '#333333';
    private readonly lightBgColor = '#cbd5e1';
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
        const startX = 50;
        const startY = 35;
        const totalWidth = 495;

        // 1. Top Banner: "Bill Of Supply"
        const bannerHeight = 22;
        doc.rect(startX, startY, totalWidth, bannerHeight).fill(this.mainColor);
        doc
            .fillColor('#ffffff')
            .font('Helvetica-Bold')
            .fontSize(11)
            .text('Bill Of Supply', startX, startY + 6, { align: 'center', width: totalWidth });

        // 2. Company Info Section
        const compY = startY + 35;
        const labelWidth = 90;
        const valueX = startX + labelWidth;

        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#333333');
        doc.text('Company Name:', startX, compY);
        doc.text('Address:', startX, compY + 14);
        doc.text('Phone No.:', startX, compY + 28);
        doc.text('Email ID:', startX, compY + 42);
        doc.text('GSTIN:', startX, compY + 56);

        doc.font('Helvetica').fillColor('#444444');
        doc.text('Leewaa Ventures LLP', valueX, compY);
        doc.text('Cherukunnu, Othukkungal, Malappuram, Kerala - 676528', valueX, compY + 14);
        doc.text('9526091000, 8943471000', valueX, compY + 28);
        doc.text('hello@leewaa.in', valueX, compY + 42);
        doc.text('32NMNPK2193G1ZP', valueX, compY + 56);

        // Draw logo on the right empty space of company details
        if (fs.existsSync(this.logoPath)) {
            doc.image(this.logoPath, 405, compY + 6, { width: 140 });
        }

        // 3. Horizontal Gray Bar 1
        const bar1Y = compY + 73;
        doc.rect(startX, bar1Y, totalWidth, 8).fill('#cbd5e1');

        // 4. Bill To & Invoice Info section
        const billY = bar1Y + 18;
        const billToValX = startX + 60;

        // Customer Info setup
        let customerName = 'Guest User';
        let customerEmail = 'N/A';
        if (order.user) {
            customerName = `${order.user.firstName} ${order.user.lastName}`;
            customerEmail = order.user.email;
        } else if (order.address) {
            customerName = order.address.fullName;
            customerEmail = order.address.email || 'N/A';
        }

        const addressVal = `${order.address.address}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`;

        // Bill To: (Left Column)
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(this.mainColor);
        doc.text('Bill To:', startX, billY);

        doc.font('Helvetica-Bold').fillColor('#333333');
        doc.text('Name:', startX, billY + 14);
        doc.text('Address:', startX, billY + 28);

        doc.font('Helvetica').fillColor('#444444');
        doc.text(customerName, billToValX, billY + 14);
        
        const addressHeight = doc.heightOfString(addressVal, { width: 195 });
        doc.text(addressVal, billToValX, billY + 28, { width: 195 });

        const phoneY = billY + 28 + addressHeight + 6;
        doc.font('Helvetica-Bold').fillColor('#333333').text('Phone No.:', startX, phoneY);
        doc.font('Helvetica').fillColor('#444444').text(order.address.phone || 'N/A', billToValX, phoneY);

        doc.font('Helvetica-Bold').fillColor('#333333').text('Email ID:', startX, phoneY + 14);
        doc.font('Helvetica').fillColor('#444444').text(customerEmail, billToValX, phoneY + 14);

        doc.font('Helvetica-Bold').fillColor('#333333').text('GSTIN:', startX, phoneY + 28);
        doc.font('Helvetica').fillColor('#444444').text(order.address.gstin || 'N/A', billToValX, phoneY + 28);

        const leftColumnEndY = phoneY + 42;

        // Invoice Details: (Right Column)
        const invoiceDetailsY = billY;
        const rightLabelX = startX + 270;
        const rightValueX = rightLabelX + 90;

        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#333333');
        doc.text('Invoice No.:', rightLabelX, invoiceDetailsY);
        doc.text('Date:', rightLabelX, invoiceDetailsY + 14);
        doc.text('Purchase Order:', rightLabelX, invoiceDetailsY + 28);
        doc.text('Due Date:', rightLabelX, invoiceDetailsY + 42);
        doc.text('Payment Mode:', rightLabelX, invoiceDetailsY + 56);
        doc.text('Place of Supply:', rightLabelX, invoiceDetailsY + 70);

        const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });

        doc.font('Helvetica').fillColor('#444444');
        doc.text(`#${order.orderNumber}`, rightValueX, invoiceDetailsY);
        doc.text(dateStr, rightValueX, invoiceDetailsY + 14);
        doc.text('N/A', rightValueX, invoiceDetailsY + 28);
        doc.text(dateStr, rightValueX, invoiceDetailsY + 42);
        doc.text(order.paymentMethod, rightValueX, invoiceDetailsY + 56);
        doc.text(order.address.state || 'Kerala', rightValueX, invoiceDetailsY + 70);

        const rightColumnEndY = invoiceDetailsY + 84;
        const sectionEndY = Math.max(leftColumnEndY, rightColumnEndY);

        // 5. Horizontal Gray Bar 2
        const bar2Y = sectionEndY + 8;
        doc.rect(startX, bar2Y, totalWidth, 8).fill('#cbd5e1');

        // 6. Table structure
        const tableTop = bar2Y + 20;
        const colOffsets = [35, 170, 55, 50, 60, 65]; // Sl No, Desc, HSN, Qty, Price, Discount
        const headerHeight = 24;

        // Draw header background
        doc.rect(startX, tableTop, totalWidth, headerHeight).fill(this.mainColor);

        // Write header text
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');
        doc.text('Sl. No.', startX, tableTop + 8, { width: 35, align: 'center' });
        doc.text('Description', startX + 37, tableTop + 8, { width: 166, align: 'left' });
        doc.text('HSN / SAC', startX + 205, tableTop + 8, { width: 55, align: 'center' });
        doc.text('Quantity', startX + 260, tableTop + 8, { width: 50, align: 'center' });
        doc.text('Price / Unit', startX + 310, tableTop + 8, { width: 60, align: 'center' });
        doc.text('Discount (total)', startX + 370, tableTop + 8, { width: 65, align: 'center' });
        doc.text('Amount', startX + 435, tableTop + 8, { width: 55, align: 'right' });

        // Table Rows
        let rowY = tableTop + headerHeight;
        doc.font('Helvetica').fontSize(8).fillColor('#333333');

        order.items.forEach((item: any, index: number) => {
            const itemTotal = Math.round(item.price * item.quantity);
            
            // Draw cells text
            doc.text((index + 1).toString(), startX, rowY + 6, { width: 35, align: 'center' });
            doc.text(item.product.name, startX + 37, rowY + 6, { width: 166, align: 'left' });
            doc.text('842121', startX + 205, rowY + 6, { width: 55, align: 'center' });
            doc.text(item.quantity.toString(), startX + 260, rowY + 6, { width: 50, align: 'center' });
            doc.text(`Rs. ${Math.round(item.price).toLocaleString('en-IN')}`, startX + 310, rowY + 6, { width: 60, align: 'center' });
            doc.text('Rs. 0', startX + 370, rowY + 6, { width: 65, align: 'center' });
            doc.text(`Rs. ${itemTotal.toLocaleString('en-IN')}`, startX + 435, rowY + 6, { width: 55, align: 'right' });
            
            // Draw horizontal row bottom line
            doc.rect(startX, rowY, totalWidth, 20).strokeColor(this.gridColor).stroke();
            rowY += 20;
        });

        // Append COD Handling Fee row to the table items if present
        if (order.handlingFee > 0) {
            const slNo = order.items.length + 1;
            doc.text(slNo.toString(), startX, rowY + 6, { width: 35, align: 'center' });
            doc.text('COD Handling Fee', startX + 37, rowY + 6, { width: 166, align: 'left' });
            doc.text('N/A', startX + 205, rowY + 6, { width: 55, align: 'center' });
            doc.text('1', startX + 260, rowY + 6, { width: 50, align: 'center' });
            doc.text(`Rs. ${Math.round(order.handlingFee).toLocaleString('en-IN')}`, startX + 310, rowY + 6, { width: 60, align: 'center' });
            doc.text('Rs. 0', startX + 370, rowY + 6, { width: 65, align: 'center' });
            doc.text(`Rs. ${Math.round(order.handlingFee).toLocaleString('en-IN')}`, startX + 435, rowY + 6, { width: 55, align: 'right' });

            doc.rect(startX, rowY, totalWidth, 20).strokeColor(this.gridColor).stroke();
            rowY += 20;
        }

        const subtotalWithHandling = order.subtotal + (order.handlingFee || 0);

        // Total Row
        doc.rect(startX, rowY, 435, 20).fill(this.mainColor);
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5).text('Total', startX + 35, rowY + 6, { width: 170, align: 'center' });

        doc.rect(startX + 435, rowY, 60, 20).strokeColor(this.gridColor).stroke();
        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(8.5).text(`Rs. ${Math.round(subtotalWithHandling).toLocaleString('en-IN')}`, startX + 435, rowY + 6, { width: 55, align: 'right' });

        // Draw vertical columns separators
        const totalTableHeight = (rowY + 20) - tableTop;
        doc.rect(startX, tableTop, totalWidth, totalTableHeight).strokeColor(this.gridColor).stroke();
        
        let currentX = startX;
        colOffsets.forEach(offset => {
            currentX += offset;
            doc.moveTo(currentX, tableTop).lineTo(currentX, rowY + 20).strokeColor(this.gridColor).stroke();
        });

        rowY += 20;

        // 7. Saved and Total Invoice Amount Boxes
        const totalSaved = order.discount + order.referralDiscount;
        const totalInvoiceAmt = order.total + (order.handlingFee || 0);

        // Saved Box
        doc.rect(startX, rowY + 8, 380, 18).fill('#e2e8f0');
        doc.rect(startX, rowY + 8, 380, 18).strokeColor(this.gridColor).stroke();
        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(8).text('The Total amount you have saved is ===>>', startX, rowY + 13, { width: 375, align: 'right' });

        doc.rect(startX + 380, rowY + 8, 115, 18).strokeColor(this.gridColor).stroke();
        doc.fillColor('#10b981').font('Helvetica-Bold').fontSize(8).text(`Rs. ${Math.round(totalSaved).toLocaleString('en-IN')}`, startX + 380, rowY + 13, { width: 110, align: 'right' });

        // Total Invoice Amount Box
        doc.rect(startX, rowY + 26, 380, 18).fill(this.lightBgColor);
        doc.rect(startX, rowY + 26, 380, 18).strokeColor(this.gridColor).stroke();
        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(8).text('The Total Invoice Amount is =====>>', startX, rowY + 31, { width: 375, align: 'right' });

        doc.rect(startX + 380, rowY + 26, 115, 18).strokeColor(this.gridColor).stroke();
        doc.fillColor(this.mainColor).font('Helvetica-Bold').fontSize(8.5).text(`Rs. ${Math.round(totalInvoiceAmt).toLocaleString('en-IN')}`, startX + 380, rowY + 31, { width: 110, align: 'right' });

        rowY += 44;

        // 8. Bottom split section (Terms & Remarks on left, Amount in words & Sign on right)
        const leftColWidth = 265;
        const rightColWidth = 220;
        const rightColX = startX + leftColWidth + 10;

        // Left Column: Terms and Remarks
        // Terms & Condition Box
        doc.rect(startX, rowY + 15, leftColWidth, 60).strokeColor(this.gridColor).stroke();
        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(7.5).text('Terms & Condition :', startX + 6, rowY + 20);
        doc.font('Helvetica').fontSize(6.5).fillColor('#555555').text(
            '1. Goods once sold will not be taken back or exchanged.\n2. All disputes are subject to Malappuram jurisdiction.',
            startX + 6,
            rowY + 32,
            { width: leftColWidth - 12 }
        );

        // Remarks Box
        doc.rect(startX, rowY + 80, leftColWidth, 70).strokeColor(this.gridColor).stroke();
        // Title background
        doc.rect(startX, rowY + 80, leftColWidth, 12).fill(this.lightBgColor);
        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(7.5).text('Remarks :', startX + 6, rowY + 82);
        
        doc.fillColor('#1b3a4b').font('Helvetica').fontSize(6.5).text(
            '1. Composition dealer is not eligible to collect the taxes on supply\n' +
            '2. Bank Details:\n' +
            '   Bank: Federal Bank\n' +
            '   Account Holder: LEEWAA VENTURES\n' +
            '   Account Number: 13650200032677\n' +
            '   IFSC: FDRL0001365',
            startX + 6,
            rowY + 95,
            { width: leftColWidth - 12 }
        );

        // Right Column: Amount in words and Signatures
        // Amount In Words Box
        doc.rect(rightColX, rowY + 15, rightColWidth, 40).strokeColor(this.gridColor).stroke();
        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(7.5).text('Amount In words:', rightColX + 6, rowY + 20);
        doc.font('Helvetica').fontSize(6.5).fillColor('#555555').text(
            amountToWords(Math.round(totalInvoiceAmt)),
            rightColX + 6,
            rowY + 30,
            { width: rightColWidth - 12 }
        );

        // Blank/Sign space Box
        doc.rect(rightColX, rowY + 60, rightColWidth, 65).strokeColor(this.gridColor).stroke();

        // Seal & Signature Footer Box
        doc.rect(rightColX, rowY + 130, rightColWidth, 20).fill('#e2e8f0');
        doc.rect(rightColX, rowY + 130, rightColWidth, 20).strokeColor(this.gridColor).stroke();
        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(7.5).text('Seal & Signature', rightColX, rowY + 137, { width: rightColWidth, align: 'center' });
    }
}
