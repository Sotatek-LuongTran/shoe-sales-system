import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ProductEntity } from 'src/database/entities/product.entity';
import { ProductResponseDto } from 'src/shared/dto/product/product-respose.dto';
import { ProductStatusEnum } from 'src/shared/enums/product.enum';

// @Exclude()
export class AdminProductResponseDto extends ProductResponseDto {
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
  status: ProductStatusEnum;

  constructor(product: ProductEntity) {
    super(product);
    this.deletedAt = product.deletedAt;
    this.status = product.status;
  }
}
