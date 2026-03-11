import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { RedisSubscriberService } from './redis-subcriber.service';

@Module({
  providers: [NotificationGateway, NotificationService, RedisSubscriberService],
  exports: [NotificationService],
})
export class NotificationModule {}
