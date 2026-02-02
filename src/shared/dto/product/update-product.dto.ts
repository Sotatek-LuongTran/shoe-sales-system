import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { Gender, ProductType } from 'src/shared/enums/product.enum';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Name of the product',
    example: 'Updated shoe name',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the product',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of the product',
    enum: ProductType,
  })
  @IsEnum(ProductType)
  @IsOptional()
  productType?: ProductType;

  @ApiPropertyOptional({
    description: 'Suitable gender',
    enum: Gender,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Brand ID',
  })
  @IsUUID()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({
    description: 'Category ID',
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Activate / Deactivate product',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
