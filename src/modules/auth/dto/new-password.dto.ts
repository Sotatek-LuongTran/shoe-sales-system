import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from "class-validator";

export class NewPasswordDto {
  @IsString()
  @Length(6, 6)
  @ApiProperty({
    description: '6-digit otp code'
  })
  otp: string;

  @IsEmail()
  @ApiProperty({
    description: 'Approver'
  })
  email: string;
  
  @ApiProperty({
    example: 'NewSupersecret123!',
    description: 'Password',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'NewSupersecret123!',
    description: 'Confirm password',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  confirmPassword: string;
}
