import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ProductVariantEntity } from 'src/database/entities/product-variant.entity';
import { ProductVariantResponseDto } from 'src/shared/dto/product-variant/product-variant-response.dto';
import { VariantStatusEnum } from 'src/shared/enums/product-variant.enum';

export class AdminVariantResponseDto extends ProductVariantResponseDto {
  @Expose()
  @ApiProperty({
    description: 'date',
    example: '2025-02-10T10:00:00Z',
  })
  deletedAt: Date | null;

  @Expose()
  @ApiProperty({
    description: 'status',
  })
  status: VariantStatusEnum;

  constructor(variant: ProductVariantEntity) {
    super(variant);
    this.deletedAt = variant.deletedAt;
    this.status = variant.status;
  }
}
