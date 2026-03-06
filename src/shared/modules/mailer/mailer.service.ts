import { InjectQueue } from '@nestjs/bull';
import {
  Injectable,
} from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class MailerService {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  async sendTemplateEmail(
    templateName: string,
    to: string,
    subject: string,
    context: any,
  ): Promise<void> {
    await this.emailQueue.add('send-email', {
      templateName,
      to,
      subject,
      context,
    });
  }
}
