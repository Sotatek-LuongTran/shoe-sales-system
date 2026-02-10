import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PaginationResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  currentPage: number;
  @Expose()
  @ApiProperty({ example: 10 })
  itemsPerPage: number;
  @Expose()
  @ApiProperty({ example: 57 })
  totalItems: number;
  @Expose()
  @ApiProperty({ example: 6 })
  totalPages: number;
}
