import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { AdminAuthService } from './admin-auth.service';
import { UserResponseDto } from 'src/shared/dto/user/user-response.dto';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('admin/auth')
@ApiTags('Admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({
    status: 201,
    description: 'User login successfully',
    type: UserResponseDto,
  })
  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    return await this.adminAuthService.login(dto);
  }
}
