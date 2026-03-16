import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorCodeEnum } from '../enums/error-code.enum';

@Injectable()
export class ImageUploadPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  transform(file: Express.Multer.File) {
    const maxSize = this.configService.get<number>('MAX_IMAGE_SIZE');

    if (!maxSize) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.IMAGE_MAX_SIZE_MISSING,
        statusCode: 404,
        message: 'Image max size is missing',
      });
    }

    if (file.size > maxSize) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.IMAGE_EXCEEDED_SIZE,
        statusCode: 400,
        message: 'Image size exceeds max size',
      });
    }

    return file;
  }
}
