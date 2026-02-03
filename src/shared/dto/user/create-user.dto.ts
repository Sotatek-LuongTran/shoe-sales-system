import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'example@email.com',
    description: 'Email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Supersecret123!',
    description: 'Password',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
