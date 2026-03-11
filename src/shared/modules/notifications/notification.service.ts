import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { OrderEventEnum, PaymentEventEnum } from 'src/shared/enums/events.enum';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  sendOrderExpired(userId: string, orderId: string) {
    this.notificationGateway.emitToUser(userId, OrderEventEnum.ORDER_EXPIRED, {
      orderId,
      message: 'Your order has expired',
      timestamp: new Date(),
    });
  }
  sendOrderCreated(userId: string, orderId: string) {
    this.notificationGateway.emitToUser(userId, OrderEventEnum.ORDER_CREATED, {
      orderId,
      message: 'Your order has been created',
      timestamp: new Date(),
    });
  }
  sendOrderCancelled(userId: string, orderId: string) {
    this.notificationGateway.emitToUser(userId, OrderEventEnum.ORDER_CANCELLED, {
      orderId,
      message: 'Your order has cancelled',
      timestamp: new Date(),
    });
  }

  sendPaymentSuccess(userId: string, orderId: string, paymentId: string) {
    this.notificationGateway.emitToUser(userId, PaymentEventEnum.PAYMENT_SUCCESS, {
      orderId,
      paymentId,
      message: 'Your payment completed successfully',
      timestamp: new Date(),
    });
  }

  sendPaymentFailed(userId: string, orderId: string, paymentId: string) {
    this.notificationGateway.emitToUser(userId, PaymentEventEnum.PAYMENT_FAILED, {
      orderId,
      paymentId,
      message: 'Your payment failed',
      timestamp: new Date(),
    });
  }
}
