import { ApiProperty } from '@nestjs/swagger';
import { ProductVariantEntity } from 'src/database/entities/product-variant.entity';
import { ResponseDto } from '../response.dto';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
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
    description: 'Image keys of the variant',
  })
  imageKeys: string[];

  constructor(productVariant: ProductVariantEntity) {
    super(productVariant.id);
    Object.assign(this, {
      variantValue: productVariant.variantValue,
      price: productVariant.price,
      stock: productVariant.stock,
      imageKeys: productVariant.images.map((image) => image.imageKey),
    });
  }
}
