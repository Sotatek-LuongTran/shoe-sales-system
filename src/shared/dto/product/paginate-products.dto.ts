import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { PaginateDto } from 'src/shared/dto/paginate.dto';
import { GenderEnum, ProductStatusEnum, ProductTypeEnum } from 'src/shared/enums/product.enum';

export class PaginateProductsDto extends PaginateDto {
  @ApiPropertyOptional({
    description: 'Max price of the product',
    example: '100',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Min price of the product',
    example: '100',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Type of the product',
    enum: ProductTypeEnum,
  })
  @IsEnum(ProductTypeEnum)
  @IsOptional()
  productType?: ProductTypeEnum;

  @ApiPropertyOptional({
    description: 'Suitable gender',
    enum: GenderEnum,
  })
  @IsEnum(GenderEnum)
  @IsOptional()
  gender?: GenderEnum;

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
    description: 'Status of the product',
    example: ProductStatusEnum.ACTIVE,
    enum: ProductStatusEnum,
  })
  @IsEnum(ProductStatusEnum)
  @IsOptional()
  status?: ProductStatusEnum;
}
