import { Processor, Process, OnQueueCompleted } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { Job } from 'bull';
import { QueueNameEnum, QueueTopicsEnum } from 'src/shared/enums/queue-topics.enum';

@Processor(QueueNameEnum.EMAIL)
export class MailerProcessor {
  private transporter: nodemailer.Transporter;
  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE') === true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  @Process(QueueTopicsEnum.SEND_EMAIL)
  private async handleSendEmail(job: Job<any>): Promise<void> {
    const { templateName, to, subject, context } = job.data;
    const html = this.compileTemplate(templateName, context);
    return await this.transporter.sendMail({
      from: `"Approval System" <${this.configService.get('SMTP_USER')}>`,
      to,
      subject,
      html,
    });
  }

  @OnQueueCompleted()
  onEmailConsumed(job: Job) {
    console.log(`Processing email with data ${JSON.stringify(job.data)}...`)
  }

  private compileTemplate(templateName: string, context: any): string {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.hbs`,
    );
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = handlebars.compile(templateSource);
    return compiledTemplate(context);
  }
}
