import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
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

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.USER)
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    type: UserResponseDto,
  })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(req.user.userId, dto);
  }
}
