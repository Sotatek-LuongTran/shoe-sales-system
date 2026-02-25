import { ApiProperty } from '@nestjs/swagger';


///sd sd
export class PaginationMetaDto {
  @ApiProperty({ example: 10 })
  totalItems: number;

  @ApiProperty({ example: 10 })
  itemCount: number;

  @ApiProperty({ example: 5 })
  itemsPerPage: number;

  @ApiProperty({ example: 2 })
  totalPages: number;

  @ApiProperty({ example: 1 })
  currentPage: number;
}

export class PaginationResponseDto<T> {
  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;

  @ApiProperty({ isArray: true })
  data: T[];
}
