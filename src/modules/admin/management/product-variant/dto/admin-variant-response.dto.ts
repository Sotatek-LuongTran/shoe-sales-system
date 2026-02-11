import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ProductVariantResponseDto } from 'src/shared/dto/product-variant/product-variant-response.dto';

export class AdminVariantResponseDto extends ProductVariantResponseDto {
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
