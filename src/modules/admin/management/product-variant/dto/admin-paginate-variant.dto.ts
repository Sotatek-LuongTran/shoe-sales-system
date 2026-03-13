import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginateVariantsDto } from 'src/shared/dto/product-variant/paginate-variants.dto';
import { VariantStatusEnum } from 'src/shared/enums/product-variant.enum';

export class AdminPaginateVariantsDto extends PaginateVariantsDto {
  @ApiPropertyOptional({
    description: 'Include deleted variants',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Status of the variant',
    example: VariantStatusEnum.ACTIVE,
    enum: VariantStatusEnum,
  })
  @IsEnum(VariantStatusEnum)
  @IsOptional()
  status?: VariantStatusEnum;
}
