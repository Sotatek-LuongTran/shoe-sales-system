import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  async uploadSingleFile(file: Express.Multer.File) {
    const key = `${uuidv4()}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
      },
    });

    await this.s3.send(command);

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: 300,
    });

    return { url, key };
  }

  async getPresignedSignedUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3, command, {
      expiresIn: 300,
    });
  }

  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3.send(command);
  }
}
