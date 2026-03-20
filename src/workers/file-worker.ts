import { NestFactory } from '@nestjs/core';
import { FileWorkerModule } from './file/file-worker.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(FileWorkerModule);
  console.log('File worker is running ...');
}
bootstrap();