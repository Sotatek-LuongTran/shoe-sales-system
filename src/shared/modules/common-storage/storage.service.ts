import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUploadUrlDto } from 'src/modules/storage/dto/create-upload-url.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
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

  async createUploadRurl(dto: CreateUploadUrlDto) {
    const key = dto.entityId
      ? `${dto.folder}/${dto.entityId}/${uuidv4()}`
      : `${dto.folder}/${uuidv4()}`;

    return createPresignedPost(this.s3, {
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
  }

  async createDownloadUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command);
  }
}
