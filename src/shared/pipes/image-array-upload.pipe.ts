import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorCodeEnum } from '../enums/error-code.enum';

@Injectable()
export class ImagesUploadPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  transform(files: Express.Multer.File[]) {
    const maxSize = this.configService.get<number>('MAX_IMAGE_SIZE');

    if (!maxSize) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.IMAGE_MAX_SIZE_MISSING,
        statusCode: 404,
        message: 'Image max size is missing',
      });
    }

    for (const file of files) {
      if (file.size > maxSize) {
        throw new BadRequestException({
          errorCode: ErrorCodeEnum.IMAGE_EXCEEDED_SIZE,
          statusCode: 400,
          message: 'Image size exceeds max size',
        });
      }
    }

    return files;
  }
}
