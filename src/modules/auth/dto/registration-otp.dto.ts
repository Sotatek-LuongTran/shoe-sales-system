import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class RegistrationOtpDto {
  @IsEmail()
  @ApiProperty({
    description: 'Approver'
  })
  email: string;

  @IsString()
  @Length(6, 6)
  @ApiProperty({
    description: '6-digit otp code'
  })
  otp: string;
}
