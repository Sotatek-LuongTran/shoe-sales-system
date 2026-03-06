import { Injectable } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';

@Command({ name: 'email-worker', description: 'Start email worker' })
@Injectable()
export class MailerWorkerCommand extends CommandRunner {
  async run(): Promise<void> {
    await new Promise(() => {});
  }
}
