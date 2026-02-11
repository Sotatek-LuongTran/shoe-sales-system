import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { PaginateVariantsDto } from '../../shared/dto/product-variant/paginate-variants.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';

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
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_NOT_FOUND,
        statusCode: 404,
      });
    }

    if (!product.brand.id) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.BRAND_NOT_FOUND,
        statusCode: 404,
      });
    }

    if (!product.category.id) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
        statusCode: 404,
      });
    }

    return this.productVariantRepository.findVariantsPagination(productId, dto);
  }

  async getProductVariant(id: string) {
    const variant = await this.productVariantRepository.findById(id);
    if (!variant) throw new NotFoundException({
      errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
      statusCode: 404,
    });

    return variant;
  }
}
