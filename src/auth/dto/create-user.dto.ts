import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'example@email.com',
    description: 'Email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name',
  })
  @IsString()
  @MinLength(6)
  name: string;

  @ApiProperty({
    example: 'Supersecret123!',
    description: 'Password',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
