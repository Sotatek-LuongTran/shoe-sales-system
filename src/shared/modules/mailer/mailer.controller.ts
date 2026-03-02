import {
  Controller,
  Post,
  Body,
  Res,
  Get,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { MailerService } from './mailer.service';
import { Response } from 'express';

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send-approval')
  @ApiResponse({
    status: 201,
    description: 'Email sent and template rendered',
  })
  async sendApprovalEmail(
    @Body()
    body: {
      to: string;
      context: {
        approver: string;
        otp: string;
        expiresIn: string;
      };
    },
  ) {
    const { to, context } = body;
    return this.mailerService.sendApprovalEmail(to, context);
  }

  @Get('preview-approval')
  previewApproval(@Res() res: Response) {
    return res.render('registration-notification', {
      appover: 'Preview User',
      link: 'https://example.com/login',
    });
  }
}
