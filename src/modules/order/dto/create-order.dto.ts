import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { GenderEnum, ProductTypeEnum } from 'src/shared/enums/product.enum';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Id of the product',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Value of the item',
    example: 'Light Blue',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  variantValue: string;

  @ApiProperty({
    description: 'Stock of the item',
    example: '10',
  })
  @IsNumber()
  @IsPositive()
  @IsInt()
  quantity: number;

  @ApiProperty({
    description: 'Price of the item',
    example: '100',
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Name of the product',
    example: 'A very useful thing',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Description of the product',
    example: 'A thing that is very useful as its name',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Type of the product',
    enum: ProductTypeEnum,
    example: ProductTypeEnum.SHOE,
  })
  @IsEnum(ProductTypeEnum)
  productType: ProductTypeEnum;

  @ApiProperty({
    description: 'The suitable gender for the product',
    enum: GenderEnum,
    example: GenderEnum.UNISEX,
  })
  @IsEnum(GenderEnum)
  gender: GenderEnum;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
