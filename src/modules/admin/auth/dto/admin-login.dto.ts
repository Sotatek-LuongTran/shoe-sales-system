import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'Password',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
