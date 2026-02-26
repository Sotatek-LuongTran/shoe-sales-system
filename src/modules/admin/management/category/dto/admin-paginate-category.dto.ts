import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginateCategoriesDto } from 'src/shared/dto/category/paginate-categories.dto';
import { CategoryStatusEnum } from 'src/shared/enums/category.enum';


export class AdminPaginateCategoriesDto extends PaginateCategoriesDto {
  @ApiPropertyOptional({
    description: 'Include deleted products',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Status of the product',
    example: CategoryStatusEnum.ACTIVE,
    enum: CategoryStatusEnum,
  })
  @IsEnum(CategoryStatusEnum)
  @IsOptional()
  status?: CategoryStatusEnum;
}
