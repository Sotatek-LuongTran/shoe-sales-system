import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({
    description: 'Name of the brand',
    example: 'Adidas',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Description of the brand',
    example: 'Sport gears providers',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Logo key',
    example: 'logos/brandId/key',
  })
  @Matches(/^[a-zA-Z0-9\-_/\.]+$/, {
    each: true,
    message: 'Each key must be a valid S3 object key',
  })
  @IsString()
  @IsNotEmpty()
  logoKey: string;
}
