import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UploadFolderEnum } from '../enums/upload-folder.enum';

export class CreateUploadUrlDto {
  @IsEnum(UploadFolderEnum)
  folder: UploadFolderEnum;

  @IsOptional()
  @IsString()
  entityId?: string;
}
