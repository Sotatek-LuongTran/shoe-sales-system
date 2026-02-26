import { Body, Controller, Get, Post, Res } from '@nestjs/common';
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
        link: string;
        token: string;
      };
    },
  ) {
    const { to, context } = body;
    return this.mailerService.sendApprovalEmail(to, context);
  }

  @Get('preview-approval')
  previewApproval(@Res() res: Response) {
    return res.render('approval-notification', {
      approver: 'Preview User',
      link: 'https://example.com/login',
      token: 'preview-token',
    });
  }
}
