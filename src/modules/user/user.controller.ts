import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { Roles } from 'src/shared/decorators/role.decorator';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { UserResponseDto } from 'src/shared/dto/user/user-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageUploadPipe } from 'src/shared/pipes/image-upload.pipe';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.USER)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'User get profile' })
  @ApiResponse({
    status: 201,
    description: 'Profile get successfully',
  })
  async getProfile(@Req() req: Request) {
    const user = req.user as {
      userId: string;
      role: string;
      sessionKey?: string;
      exp?: number;
    };
    return {
      userId: user.userId,
      role: user.role,
    };
  }

  @Post('change-password')
  @ApiOperation({ summary: 'User change profile' })
  @ApiResponse({
    status: 201,
    description: 'Password changed successfully',
  })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(req.user.userId, dto);
  }

  @Post('change-avatar')
  @ApiOperation({ summary: 'User change avatar' })
  @ApiResponse({
    status: 201,
    description: 'Avatar changed successfully',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async changeAvatar(
    @Req() req: any,
    @UploadedFile(ImageUploadPipe)
    file: Express.Multer.File,
  ) {
    return this.userService.changeAvatar(req.user.userId, file);
  }
}
