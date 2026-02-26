import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginateProductsDto } from 'src/shared/dto/product/paginate-products.dto';
import { ProductStatusEnum } from 'src/shared/enums/product.enum';

export class AdminPaginateProductsDto extends PaginateProductsDto {
  @ApiPropertyOptional({
    description: 'Include deleted products',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Status of the product',
    example: ProductStatusEnum.ACTIVE,
    enum: ProductStatusEnum,
  })
  @IsEnum(ProductStatusEnum)
  @IsOptional()
  status?: ProductStatusEnum;
}
