import { NestFactory } from '@nestjs/core';
import { MailerWorkerModule } from './mailer/mailer-worker.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(MailerWorkerModule);
  console.log('Email worker is running ...');
}
bootstrap();