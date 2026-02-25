import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 2 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}

export class PaginationResponseDto<T> {
  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;

  @ApiProperty({ isArray: true })
  data: T[];
}
