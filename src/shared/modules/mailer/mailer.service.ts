import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
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

  async sendApprovalEmail(
    to: string,
    context: { approver: string; link: string; token: string },
  ) {
    if (!to || !context?.approver || !context?.link || !context?.token) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.MAILER_MISSING_INFORMATION,
        statusCode: 400,
        message: 'Missing required fields: to, approver, link or token',
      });
    }
    return this.sendTemplateEmail(
      'registration-notification',
      to,
      'Approval Required',
      context,
    );
  }

  private async sendTemplateEmail(
    templateName: string,
    to: string,
    subject: string,
    context: any,
  ): Promise<void> {
    const html = this.compileTemplate(templateName, context);
    try {
      await this.transporter.sendMail({
        from: `"Approval System" <${this.configService.get('SMTP_USER')}>`,
        to,
        subject: subject,
        html,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Send Email Error:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
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
