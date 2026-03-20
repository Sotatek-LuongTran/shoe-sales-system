import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUploadUrlDto } from 'src/modules/storage/dto/create-upload-url.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { v4 as uuidv4 } from 'uuid';
import { FileRepository } from '../files/file.repository';
import { FileStatusEnum } from 'src/shared/enums/file-status.enum';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly fileRepository: FileRepository,
  ) {
    const bucket = this.configService.get<string>('S3_BUCKET');
    const region = this.configService.get<string>('S3_REGION');
    const accessKey = this.configService.get<string>('S3_ACCESS_KEY');
    const secretKey = this.configService.get<string>('S3_SECRET_KEY');
    const endpoint = this.configService.get<string>('S3_ENDPOINT');

    if (!bucket || !region || !accessKey || !secretKey) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.STORAGE_MISSING_CONFIG_VALUE,
        statusCode: 404,
        message: 'S3 config values missing',
      });
    }
    this.bucket = bucket;

    this.s3 = new S3Client({
      endpoint: endpoint,
      region: region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });
  }

  async createUploadRurl(userId: string, dto: CreateUploadUrlDto) {
    const key = dto.entityId
      ? `${dto.folder}/${dto.entityId}/${uuidv4()}`
      : `${dto.folder}/${uuidv4()}`;

    const uploadData = await createPresignedPost(this.s3, {
      Bucket: this.bucket,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 10 * 1024 * 1024],
        ['starts-with', '$Content-Type', 'image/'],
      ],
      Fields: {
        key,
      },
    });

    const file = this.fileRepository.create({
      ownerId: userId,
      key: key,
      status: FileStatusEnum.ACTIVE,
    });

    await this.fileRepository.save(file);

    return uploadData;
  }

  async createDownloadUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const file = await this.fileRepository.findFileByKey(key);

    if (!file) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.FILE_NOT_FOUND,
        statusCode: 404,
        message: 'File not found',
      });
    }
    if (file.status === FileStatusEnum.INACTIVE) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.FILE_INVALID_STATUS,
        statusCode: 404,
        message: 'File is inactive',
      });
    }

    return getSignedUrl(this.s3, command);
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.configService.get('S3_BUCKET'),
        Key: key,
      }),
    );

    const file = await this.fileRepository.findFileByKey(key);
    if (!file) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.FILE_NOT_FOUND,
        statusCode: 404,
        message: 'File not found',
      });
    }

    await this.fileRepository.delete(file);
  }
}
