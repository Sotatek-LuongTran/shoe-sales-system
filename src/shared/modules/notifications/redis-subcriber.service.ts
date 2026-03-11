import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from 'src/shared/modules/redis/redis.service';
import { NotificationGateway } from './notification.gateway';
import { OrderEventEnum, PaymentEventEnum } from 'src/shared/enums/events.enum';

@Injectable()
export class RedisSubscriberService implements OnModuleInit {
  constructor(
    private readonly redisService: RedisService,
    private readonly gateway: NotificationGateway,
  ) {}

  async onModuleInit() {
    const subscriber = await this.redisService.duplicate();

    await subscriber.subscribe(...Object.values(OrderEventEnum));
    await subscriber.subscribe(...Object.values(PaymentEventEnum));

    subscriber.on('message', (channel, message) => {
      switch (channel) {
        case OrderEventEnum.ORDER_EXPIRED:
        case OrderEventEnum.ORDER_CREATED:
        case OrderEventEnum.ORDER_CANCELLED:
        case PaymentEventEnum.PAYMENT_SUCCESS:
        case PaymentEventEnum.PAYMENT_FAILED:
          this.handleSubscribedEvent(channel, message);
          return;
        default:
          return;
      }
    });
  }

  private handleSubscribedEvent(event: string, message: string) {
    try {
      const data = JSON.parse(message);
      console.log('Redis event received:', { event, data });
      this.gateway.emitToUser(data.userId, event, data);
    } catch (e) {
      console.warn('Invalid Redis message:', message, e);
    }
  }
}
