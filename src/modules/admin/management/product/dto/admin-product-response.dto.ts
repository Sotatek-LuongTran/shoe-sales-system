import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ProductResponseDto } from 'src/shared/dto/product/product-respose.dto';

@Exclude()
export class AdminProductResponseDto extends ProductResponseDto {
  @Expose()
  @ApiProperty({
    description: 'status',
    example: 'true',
  })
  isActive: boolean;

  @Expose()
  @ApiProperty({
    description: 'date',
    example: '2025-02-10T10:00:00Z',
  })
  deletedAt: Date | null;
}
