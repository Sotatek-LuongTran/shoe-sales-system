import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { Roles } from 'src/shared/decorators/role.decorator';
import { Request } from 'express';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRoleEnum.USER)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'User get profile' })
  @ApiResponse({
    status: 201,
    description: '201',
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
}
