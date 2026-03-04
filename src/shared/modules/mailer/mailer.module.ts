import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { BullModule } from '@nestjs/bull';
import { MailerProcessor } from './mailer.processor';

@Module({
  imports: [ConfigModule,
    BullModule.registerQueue({
      name: 'email'
    })
  ],
  providers: [MailerService, MailerProcessor],
  exports: [MailerService],
})
export class MailerModule {}
