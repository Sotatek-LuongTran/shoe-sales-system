import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from 'src/database/entities/product.entity';
import { GenderEnum, ProductTypeEnum } from 'src/shared/enums/product.enum';
import { ResponseDto } from '../response.dto';
import { ProductVariantResponseDto } from '../product-variant/product-variant-response.dto';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductResponseDto extends ResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Name of the product',
    example: 'A very useful thing',
  })
  name: string;
  @Expose()
  @ApiProperty({
    description: 'Description of the product',
    example: 'A thing that is very useful as its name',
    required: false,
    maxLength: 500,
  })
  description?: string;
  @Expose()
  @ApiProperty({
    description: 'Min price',
    example: 50,
  })
  minPrice: number;
  @Expose()
  @ApiProperty({
    description: 'Max price',
    example: 100,
  })
  maxPrice: number;
  @Expose()
  @ApiProperty({
    description: 'Type of the product',
    enum: ProductTypeEnum,
    example: ProductTypeEnum.SHOE,
  })
  productType: ProductTypeEnum;
  @Expose()
  @ApiProperty({
    description: 'The suitable gender for the product',
    enum: GenderEnum,
    example: GenderEnum.UNISEX,
  })
  gender: GenderEnum;
  @Expose()
  @ApiProperty({
    description: 'Brand of the product',
  })
  brandName: string;
  @Expose()
  @ApiProperty({
    description: 'Category of the product',
  })
  categoryName: string;
  @Expose()
  @ApiProperty({
    description: 'List of variants',
  })
  productVariants: ProductVariantResponseDto[];

  constructor(product: ProductEntity) {
    super(product.id);

    const prices = (product.variants ?? [])
      .map((v) => v.price)

    Object.assign(this, {
      ...product,
      brandName: product.brand?.name ?? null,
      categoryName: product.category?.name ?? null,
      productVariants:
        product.variants?.map(
          (variant) => new ProductVariantResponseDto(variant),
        ) ?? [],
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
    });
  }
}
