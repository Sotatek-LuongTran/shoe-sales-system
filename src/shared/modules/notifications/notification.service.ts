import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderEventEnum, PaymentEventEnum } from 'src/shared/enums/events.enum';
import Redis from 'ioredis';

const Emitter = require('socket.io-emitter');

@Injectable()
export class NotificationService implements OnModuleDestroy {
  private emitter: any;
  private redisClient?: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST') ?? 'localhost',
      port: this.configService.get<number>('REDIS_PORT') ?? 6379,
    });

    this.emitter = new Emitter(redis);
    this.redisClient = redis;
  }

  async onModuleDestroy() {
    await this.redisClient?.quit();
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
