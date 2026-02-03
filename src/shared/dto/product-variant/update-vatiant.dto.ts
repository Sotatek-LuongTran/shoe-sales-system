import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateVariantDto {
  @ApiProperty({
    description: 'Id of the variant',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Value of the variant',
    example: 'Blue',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @IsOptional()
  variantValue?: string;

  @ApiProperty({
    description: 'Price of the variant',
    example: '100',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Stock of the variant',
    example: '10',
  })
  @IsNumber()
  @IsPositive()
  @IsInt()
  @IsOptional()
  stock?: number;
}
