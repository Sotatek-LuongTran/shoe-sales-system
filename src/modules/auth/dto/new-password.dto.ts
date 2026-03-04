import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class NewPasswordDto {
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
