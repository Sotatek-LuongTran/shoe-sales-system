import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginateDto } from 'src/shared/dto/paginate.dto';
import { BrandStatusEnum } from 'src/shared/enums/brand.enum';

export class PaginateBrandsDto extends PaginateDto {
  @ApiPropertyOptional({
    description: 'Status of the product',
    example: BrandStatusEnum.ACTIVE,
    enum: BrandStatusEnum,
  })
  @IsEnum(BrandStatusEnum)
  @IsOptional()
  status?: BrandStatusEnum;
}
