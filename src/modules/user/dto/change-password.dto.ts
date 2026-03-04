import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({
    example: 'Supersecret123!',
    description: 'Password',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    example: 'SecondSupersecret123!',
    description: 'Password',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({
    example: 'SecondSupersecret123!',
    description: 'Confirm password',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  confirmPassword: string;
}
