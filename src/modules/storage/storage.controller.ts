import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { StorageService } from 'src/shared/modules/common-storage/storage.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload-url')
  async createUploadUrl(@Body() dto: CreateUploadUrlDto) {
    return this.storageService.createUploadRurl(dto);
  }

  @Get('download-url')
  async createDownloadUrl(@Query('key') key: string) {
    return this.storageService.createDownloadUrl(key);
  }
}
