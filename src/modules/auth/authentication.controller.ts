import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponseDto } from 'src/shared/dto/user/user-response.dto';
import { Response } from 'express';
import { RegistrationOtpDto } from './dto/registration-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { RefreshTokenGuard } from 'src/shared/guards/refresh-token.guard';
import { ApiBaseResponse } from 'src/shared/decorators/api-base-response.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBaseResponse(UserResponseDto)
  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 201,
    description: 'User login successfully',
  })
  @Post('login')
  @UseInterceptors(ClassSerializerInterceptor)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 201, description: 'Token refreshed successfully' })
  @ApiBearerAuth('refresh-token')
  @UseGuards(RefreshTokenGuard)
  async refresh(@Req() req: any) {
    const refreshToken = req['refreshToken'];
    console.log(refreshToken)
    return this.authService.refeshAccessToken(refreshToken);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm account registration' })
  @ApiResponse({ status: 201, description: 'Account confirmed successfully' })
  async confirmAccountActivation(
    @Body() dto: RegistrationOtpDto,
    @Res() res: Response,
  ) {
    return await this.authService.confirmRegistration(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send forgot password email' })
  @ApiResponse({
    status: 201,
    description: 'Password forgot confirmed successfully',
  })
  async sendForgotPasswordEmail(@Query('email') approver: string) {
    return this.authService.sendForgotPasswordRequest(approver);
  }

  @Post('forgot-password/confirm')
  @ApiOperation({ summary: 'Confirm forgot password' })
  @ApiResponse({
    status: 201,
    description: 'Password forgot confirmed successfully',
  })
  async confirmChangePassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.confirmChangePasswordOtp(dto);
  }

  @Post('forgot-password/change-password')
  @ApiOperation({ summary: 'User change profile' })
  @ApiResponse({
    status: 201,
    description: 'Password changed successfully',
  })
  async changePassword(@Body() dto: NewPasswordDto) {
    return this.authService.changeForgotPassword(dto);
  }
}
