import { Controller, Post, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { MailerService } from './mailer.service';


@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send-approval')
  @ApiResponse({
    status: 201,
    description: 'Email sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendApprovalEmail(@Body() body: { to: string; context: { approver: string; link: string }}) {
    const { to, context } = body;
    return this.mailerService.sendApprovalEmail(to, context);
  }
}
