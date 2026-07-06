import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ReturnsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createReturnDto: { orderNumber: string; phone: string; reason: string }) {
    const { orderNumber, phone, reason } = createReturnDto;

    // Find the order
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        address: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.address.phone !== phone && order.user?.phone !== phone) {
      throw new BadRequestException('Phone number does not match order details');
    }

    // Check if already exists
    const existingReturn = await this.prisma.returnRequest.findFirst({
      where: { orderId: order.id }
    });

    if (existingReturn) {
      throw new BadRequestException('A return request already exists for this order');
    }

    // Create the return request
    const returnRequest = await this.prisma.returnRequest.create({
      data: {
        orderId: order.id,
        userId: order.userId,
        phoneNumber: phone,
        reason,
        status: 'PENDING'
      }
    });

    // Send email to admin
    await this.mailService.sendAdminReturnAlert(returnRequest, order);

    return {
      message: 'Return request submitted successfully',
      returnRequest
    };
  }

  async getPendingCount() {
    const count = await this.prisma.returnRequest.count({
      where: { status: 'PENDING' }
    });
    return { count };
  }

  async findAll() {
    return this.prisma.returnRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            address: true,
            user: true
          }
        }
      }
    });
  }

  async approve(id: string) {
    const returnRequest = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { 
        order: {
          include: { address: true, user: true }
        }
      }
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    // Update return request status
    const updatedReturn = await this.prisma.returnRequest.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    // Optionally update order status
    await this.prisma.order.update({
      where: { id: returnRequest.orderId },
      data: { status: 'REFUNDED' } // Or a new status if RETURNED is not present
    });

    // Send email to customer
    await this.mailService.sendReturnStatusEmail(updatedReturn, returnRequest.order, 'APPROVED');

    return { message: 'Return approved', returnRequest: updatedReturn };
  }

  async reject(id: string) {
    const returnRequest = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { 
        order: {
          include: { address: true, user: true }
        }
      }
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    // Update return request status to REJECTED
    const updatedReturn = await this.prisma.returnRequest.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    // Send email to customer
    await this.mailService.sendReturnStatusEmail(updatedReturn, returnRequest.order, 'REJECTED');

    return { message: 'Return rejected', returnRequest: updatedReturn };
  }

  async receive(id: string) {
    const returnRequest = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { 
        order: {
          include: { items: true }
        }
      }
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    if (returnRequest.status !== 'APPROVED') {
      throw new BadRequestException('Only approved returns can be marked as received');
    }

    // Update return request status to RECEIVED
    const updatedReturn = await this.prisma.returnRequest.update({
      where: { id },
      // Use any to bypass strict type checking until prisma generate is run
      data: { status: 'RECEIVED' as any }
    });

    // Handle Restocking
    if (returnRequest.order && returnRequest.order.items) {
      for (const item of returnRequest.order.items) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }
    }

    return { message: 'Return received and stock updated', returnRequest: updatedReturn };
  }
}
