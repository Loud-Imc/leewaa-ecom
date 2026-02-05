import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private invoicesService: InvoicesService,
  ) {
    const port = this.configService.get<number>('SMTP_PORT');
    const secure = this.configService.get('SMTP_SECURE') === 'true' || port === 465;

    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: Number(port),
      secure: secure,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendOrderConfirmation(order: any) {
    const to = order.address.email || (order.user ? order.user.email : null);
    if (!to) return;

    const itemsHtml = order.items
      .map(
        (item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name} x ${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; color: #333;">
        <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #157fb8;">
          <img src="cid:leewaa-logo" alt="Leewaa" style="height: 50px; width: auto;" />
          <p style="color: #666; font-style: italic; margin: 10px 0 0 0;">Quality is our priority</p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 5px solid #157fb8;">
          <h2 style="margin-top: 0; color: #157fb8; font-size: 22px;">Order Confirmed!</h2>
          <p style="font-size: 16px; margin-bottom: 10px;">Hi <strong>${order.address.fullName}</strong>,</p>
          <p style="font-size: 15px; margin: 0;">Thank you for your order! Your order <span style="background: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;">#${order.orderNumber}</span> has been confirmed and is now being processed.</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #ffffff;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 12px; text-align: left; font-size: 14px; text-transform: uppercase; color: #64748b;">Item Description</th>
              <th style="padding: 12px; text-align: right; font-size: 14px; text-transform: uppercase; color: #64748b;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot style="border-top: 2px solid #e2e8f0;">
            <tr>
              <td style="padding: 12px 12px 6px 12px; text-align: right; color: #64748b;">Subtotal</td>
              <td style="padding: 12px 12px 6px 12px; text-align: right; font-weight: 500;">₹${order.subtotal.toFixed(2)}</td>
            </tr>
            ${order.discount > 0 ? `
            <tr>
              <td style="padding: 6px 12px; text-align: right; color: #dc2626;">Discount</td>
              <td style="padding: 6px 12px; text-align: right; color: #dc2626; font-weight: 500;">-₹${order.discount.toFixed(2)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 6px 12px; text-align: right; color: #64748b;">Taxable Amount</td>
              <td style="padding: 6px 12px; text-align: right; font-weight: 500;">₹${(order.taxableAmount || (order.total / 1.18)).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px; text-align: right; color: #64748b;">GST (18%)</td>
              <td style="padding: 6px 12px; text-align: right; font-weight: 500;">₹${(order.tax || (order.total - (order.total / 1.18))).toFixed(2)}</td>
            </tr>
            <tr style="font-size: 18px; font-weight: bold;">
              <td style="padding: 15px 12px; text-align: right; border-top: 1px solid #e2e8f0;">Total Amount</td>
              <td style="padding: 15px 12px; text-align: right; color: #157fb8; border-top: 1px solid #e2e8f0;">₹${order.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 25px;">
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
            <h3 style="color: #157fb8; margin: 0 0 10px 0; font-size: 16px; text-transform: uppercase;">Delivery Address</h3>
            <p style="margin: 0; color: #475569; line-height: 1.6; font-size: 15px;">
              <strong>${order.address.fullName}</strong><br>
              ${order.address.address}, ${order.address.city}<br>
              ${order.address.state} - ${order.address.pincode}<br>
              <span style="display: block; margin-top: 8px; font-weight: 600;">Phone: ${order.address.phone}</span>
            </p>
          </div>
        </div>

        <div style="text-align: center; color: #94a3b8; font-size: 13px; margin-top: 35px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #157fb8;">Thank you for choosing LEEWAA!</p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Leewaa E-commerce. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">For support: hello@leewaa.in | www.leewaa.in</p>
        </div>
      </div>
    `;

    try {
      const pdfBuffer = await this.invoicesService.generateInvoiceBuffer(order);
      const attachments: any[] = [
        {
          filename: `Invoice-${order.orderNumber}.pdf`,
          content: pdfBuffer,
        },
      ];

      // Add logo as CID attachment if it exists
      const logoPath = path.join(process.cwd(), '..', 'storefront', 'public', 'images', 'Leewa_logo_web.png');
      if (fs.existsSync(logoPath)) {
        attachments.push({
          filename: 'Leewa_logo_web.png',
          path: logoPath,
          cid: 'leewaa-logo',
        });
      }

      await this.transporter.sendMail({
        from: `"Leewaa E-commerce" <${this.configService.get('SMTP_FROM')}>`,
        to,
        subject: `Order Confirmation - #${order.orderNumber}`,
        html,
        attachments,
      });
      console.log(`Order confirmation email sent to ${to} with PDF attachment`);
    } catch (error) {
      console.error('Failed to send order confirmation email', error);
    }
  }
}
