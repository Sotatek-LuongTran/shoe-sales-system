import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginateBrandsDto } from 'src/shared/dto/brand/paginate-brands.dto';
import { BrandStatusEnum } from 'src/shared/enums/brand.enum';

export class AdminPaginateBrandsDto extends PaginateBrandsDto {
  @ApiPropertyOptional({
    description: 'Include deleted products',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Status of the product',
    example: BrandStatusEnum.ACTIVE,
    enum: BrandStatusEnum,
  })
  @IsEnum(BrandStatusEnum)
  @IsOptional()
  status?: BrandStatusEnum;
}
