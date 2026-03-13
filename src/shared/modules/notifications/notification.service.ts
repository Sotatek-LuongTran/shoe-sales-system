import { Injectable } from '@nestjs/common';
import { OrderEventEnum, PaymentEventEnum } from 'src/shared/enums/events.enum';
import Redis from 'ioredis';

const Emitter = require('socket.io-emitter');

@Injectable()
export class NotificationService {
  private emitter: any;

  async onModuleInit() {
    const redis = new Redis({
      host: 'localhost',
      port: 6379,
    });

    this.emitter = new Emitter(redis);
  }

  sendOrderExpired(userId: string, orderId: string) {
    this.emitter.to(userId).emit(OrderEventEnum.ORDER_EXPIRED, {
      orderId,
      message: 'Your order has expired',
      timestamp: new Date(),
    });

    console.log('Order expired:')
    console.log('- User: ' + userId);
    console.log('- Order: ' + orderId);
  }
  sendOrderCreated(userId: string, orderId: string) {
    this.emitter.to(userId).emit(OrderEventEnum.ORDER_CREATED, {
      orderId,
      message: 'Your order has been created',
      timestamp: new Date(),
    });

    console.log('Order created:')
    console.log('- User: ' + userId);
    console.log('- Order: ' + orderId);
  }
  sendOrderCancelled(userId: string, orderId: string) {
    this.emitter.to(userId).emit(OrderEventEnum.ORDER_CANCELLED, {
      orderId,
      message: 'Your order has been cancelled',
      timestamp: new Date(),
    });
    console.log('Order cancelled:')
    console.log('- User: ' + userId);
    console.log('- Order: ' + orderId);
  }

  sendPaymentSuccess(userId: string, orderId: string, paymentId: string) {
    this.emitter.to(userId).emit(PaymentEventEnum.PAYMENT_SUCCESS, {
      orderId,
      paymentId,
      message: 'Your payment is completed',
      timestamp: new Date(),
    });

    console.log('Payment success:')
    console.log('- User: ' + userId);
    console.log('- Order: ' + orderId);
  }

  sendPaymentFailed(userId: string, orderId: string, paymentId: string) {
    this.emitter.to(userId).emit(PaymentEventEnum.PAYMENT_FAILED, {
      orderId,
      paymentId,
      message: 'Your payment failed',
      timestamp: new Date(),
    });

    console.log('Payment failed:')
    console.log('- User: ' + userId);
    console.log('- Order: ' + orderId);
  }
}
