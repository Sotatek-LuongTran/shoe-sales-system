import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class PaginateDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Limit object per page',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search keywords',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Include deleted products',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean;
}
