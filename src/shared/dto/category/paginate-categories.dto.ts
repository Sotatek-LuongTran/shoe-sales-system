import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginateDto } from 'src/shared/dto/paginate.dto';
import { CategoryStatusEnum } from 'src/shared/enums/category.enum';

export class PaginateCategoriesDto extends PaginateDto {
}
