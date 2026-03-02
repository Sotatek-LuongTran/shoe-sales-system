import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginateDto } from 'src/shared/dto/paginate.dto';
import { BrandStatusEnum } from 'src/shared/enums/brand.enum';

export class PaginateBrandsDto extends PaginateDto {
}
