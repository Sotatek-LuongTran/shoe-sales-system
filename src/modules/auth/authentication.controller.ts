import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from '../user/dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from 'src/shared/dto/user/user-response.dto';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { Roles } from 'src/shared/decorators/role.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: UserResponseDto,
  })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ 
    status: 201, 
    description: 'User login successfully',
    type: UserResponseDto,
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ 
    status: 201, 
    description: 'User logout successfully',
    type: UserResponseDto,
  })
  @Post('logout')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRoleEnum.USER)
  async logout(@Req() req: Request) {
    const user = req.user as {
      userId: string;
      role: string;
      sessionKey?: string;
      exp?: number;
    };
    return this.authService.logout(user.sessionKey, user.exp);
  }
}
