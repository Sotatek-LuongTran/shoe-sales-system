import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
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
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  variantValue?: string;

  @ApiProperty({
    description: 'Price of the variant',
    example: '100',
  })
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiProperty({
    description: 'Stock of the variant',
    example: '10',
  })
  @IsNumber()
  @IsPositive()
  @IsInt()
  stock?: number;
}
