import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { PaginateVariantsDto } from '../../shared/dto/product-variant/paginate-variants.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { ProductVariantResponseDto } from 'src/shared/dto/product-variant/product-variant-response.dto';
import { VariantImageResponseDto } from 'src/shared/dto/product-variant/variant-image-response.dto';

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
        message: 'Product not found',
      });
    }

    if (!product.brand.id) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.BRAND_NOT_FOUND,
        statusCode: 404,
        message: 'Brand not found',
      });
    }

    if (!product.category.id) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
        statusCode: 404,
        message: 'Category not found',
      });
    }

    const variants =
      await this.productVariantRepository.findVariantsPaginationUser(
        productId,
        dto,
      );

    const items = await Promise.all(
      variants.items.map((item) => {
        const dto = new ProductVariantResponseDto(item);

        const imageDtos = item.images.map(
          (image) => new VariantImageResponseDto(image),
        );
        dto.images = imageDtos;
        return dto;
      }),
    );

    return {
      items: items,
      meta: variants.meta,
    }
  }

  async getProductVariant(productId: string, variantId: string) {
    const product =
      await this.productRepository.findOneWithBrandAndCategory(productId);
    if (!product) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_NOT_FOUND,
        statusCode: 404,
        message: 'Product not found',
      });
    }
    if (!product.brand.id) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.BRAND_NOT_FOUND,
        statusCode: 404,
        message: 'Brand not found',
      });
    }

    if (!product.category.id) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
        statusCode: 404,
        message: 'Category not found',
      });
    }

    const variant = await this.productVariantRepository.findVariantWithImages(
      productId,
      variantId,
    );
    if (!variant)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
        statusCode: 404,
        message: 'Variant not found',
      });

    console.log(variant);

    return new ProductVariantResponseDto(variant);
  }
}
