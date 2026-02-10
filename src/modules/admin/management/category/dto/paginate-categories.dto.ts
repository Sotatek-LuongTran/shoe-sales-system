import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginateDto } from 'src/shared/dto/paginate.dto';

export class PaginateCategoriesDto extends PaginateDto {

}
