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

export class CreateVariantDto {
  @ApiProperty({
    description: 'Value of the variant',
    example: 'Light Blue',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  variantValue: string;

  @ApiProperty({
    description: 'Price of the variant',
    example: '100',
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Stock of the variant',
    example: '10',
  })
  @IsNumber()
  @IsPositive()
  @IsInt()
  stock: number;

  @ApiProperty({
    description: 'Id of the product',
  })
  @IsUUID()
  productId: string;
}
