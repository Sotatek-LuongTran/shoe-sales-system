import { Injectable } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';

@Command({ name: 'order-worker', description: 'Start order expiring worker' })
@Injectable()
export class OrderWorkerCommand extends CommandRunner {
  async run(): Promise<void> {
    await new Promise(() => {});
  }
}
