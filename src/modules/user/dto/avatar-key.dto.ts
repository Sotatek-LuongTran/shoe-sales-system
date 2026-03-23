import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class AvatarKeyDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9\-_/\.]+$/, {
    each: true,
    message: 'Each key must be a valid S3 object key',
  })
  @ApiProperty({
    example:
      'avatars/d3fbe250-a516-4b75-b3e6-75e52ccce2c2/9442b725-6fa5-4ae2-9fb7-e36c668fa69f',
  })
  key: string;
}
