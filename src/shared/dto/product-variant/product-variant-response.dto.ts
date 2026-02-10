import { ApiProperty } from '@nestjs/swagger';
import { ProductVariantEntity } from 'src/database/entities/product-variant.entity';
import { ProductResponseDto } from '../product/product-respose.dto';
import { ResponseDto } from '../response.dto';
import { Expose } from 'class-transformer';

export class ProductVariantResponseDto extends ResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Value of the variant',
    example: 'Light Blue',
  })
  variantValue: string;

  @Expose()
  @ApiProperty({
    description: 'Price of the variant',
    example: '100',
  })
  price: number;

  @Expose()
  @ApiProperty({
    description: 'Stock of the variant',
    example: '10',
  })
  stock: number;

  @Expose()
  @ApiProperty({
    description: 'Id of the product',
  })
  product: ProductResponseDto;

  constructor(productVariant: ProductVariantEntity) {
    super(productVariant.id);
    Object.assign(this, {
        variantValue: productVariant.variantValue,
        price: productVariant.price,
        stock: productVariant.stock,
    });
  }
}
