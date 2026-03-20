import { Injectable } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';

@Command({ name: 'file-worker', description: 'Start file worker' })
@Injectable()
export class FileWorkerCommand extends CommandRunner {
  async run(): Promise<void> {
    await new Promise(() => {});
  }
}
