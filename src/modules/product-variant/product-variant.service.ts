import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { PaginateVariantsDto } from './dto/paginate-variants.dto';

@Injectable()
export class ProductVariantService {
  constructor(
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly productRepository: ProductRepository,
  ) {}


  async getVariantsByProductPagination(
    productId: string,
    dto: PaginateVariantsDto,
  ) {
    const product =
      await this.productRepository.findOneWithBrandAndCategory(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.brand.id) {
      throw new NotFoundException('Product brand not found');
    }

    if (!product.category.id) {
      throw new NotFoundException('Product category not found');
    }

    return this.productVariantRepository.findVariantsPagination(productId, dto);
  }

  async getProductVariant(id: string) {
    const variant = await this.productVariantRepository.findById(id);
    if (!variant) throw new NotFoundException('Product variant not found');

    return variant;
  }
}
