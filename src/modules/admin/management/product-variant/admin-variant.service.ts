import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVariantDto } from 'src/modules/admin/management/product-variant/dto/create-variant.dto';
import { UpdateVariantDto } from 'src/modules/admin/management/product-variant/dto/update-vatiant.dto';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { AdminVariantResponseDto } from './dto/admin-variant-response.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { VariantStatusEnum } from 'src/shared/enums/product-variant.enum';
import { AdminPaginateVariantsDto } from './dto/admin-paginate-variant.dto';
import { VariantImageRepository } from 'src/shared/modules/common-product-variant/variant-image.repository';
import { ImageKeysDto } from './dto/image-keys.dto';

@Injectable()
export class AdminProductVariantService {
  constructor(
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly productRepository: ProductRepository,
    private readonly variantImageRepository: VariantImageRepository,
  ) {}

  async createProductVariant(createVariantDto: CreateVariantDto) {
    const product = await this.productRepository.findById(
      createVariantDto.productId,
    );
    if (!product)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_NOT_FOUND,
        statusCode: 404,
        message: 'Product not found',
      });

    const variant = this.productVariantRepository.create({
      variantValue: createVariantDto.variantValue,
      price: createVariantDto.price,
      stock: createVariantDto.stock,
      product: product,
      status: VariantStatusEnum.ACTIVE,
    });

    await this.productVariantRepository.save(variant);
    const keys = createVariantDto.keysDto?.keys ?? [];

    if (keys.length > 0) {
      const images = keys.map((key) =>
        this.variantImageRepository.create({
          imageKey: key,
          variant,
        }),
      );

      await this.variantImageRepository.save(images);
    }
    return new AdminVariantResponseDto(variant);
  }

  async updateProductVariant(updateVariantDto: UpdateVariantDto) {
    const variant = await this.productVariantRepository.findById(
      updateVariantDto.id,
    );
    if (!variant)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
        statusCode: 404,
        message: 'Variant not found',
      });

    // Handle isActive flag to update status
    if (updateVariantDto.isActive !== undefined) {
      variant.status = updateVariantDto.isActive
        ? VariantStatusEnum.ACTIVE
        : VariantStatusEnum.INACTIVE;
    }

    // Assign other fields (variantValue, price, stock)
    // Using destructuring to exclude isActive and id which are handled separately
    const { id, isActive, ...rest } = updateVariantDto;
    Object.assign(variant, rest);

    await this.productVariantRepository.save(variant);
  }

  async deleteProductVariant(id: string) {
    const variant = await this.productVariantRepository.findById(id);
    if (!variant)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
        statusCode: 404,
        message: 'Variant not found',
      });

    variant.deletedAt = new Date(Date.now());

    await this.productVariantRepository.save(variant);
  }

  async getVariantsByProductPagination(
    productId: string,
    dto: AdminPaginateVariantsDto,
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
      await this.productVariantRepository.findVariantsPaginationAdmin(
        productId,
        dto,
      );

    return {
      data: variants.items.map((item) => new AdminVariantResponseDto(item)),
      meta: variants.meta,
    };
  }

  async getProductVariant(id: string) {
    const variant = await this.productVariantRepository.findById(id);
    if (!variant)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
        statusCode: 404,
        message: 'Variant not found',
      });

    return new AdminVariantResponseDto(variant);
  }

  async deactivateProductVariant(variantId: string) {
    const variant = await this.productVariantRepository.findById(variantId);
    if (!variant) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
        status: 404,
        message: 'Product variant not found',
      });
    }
    variant.status = VariantStatusEnum.INACTIVE;
    await this.productVariantRepository.save(variant);
  }

  async restoreProductVariant(variantId: string) {
    const variant =
      await this.productVariantRepository.findInactiveVariant(variantId);

    if (!variant) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
        statusCode: 404,
        message: 'Variant not found',
      });
    }

    variant.status = VariantStatusEnum.ACTIVE;
    await this.productVariantRepository.save(variant);
  }

  async removeSoftDeletedVariants() {
    await this.productVariantRepository.removeSoftDeletedVariants();
  }

  async uploadVariantImages(
    productId: string,
    variantId: string,
    dto: ImageKeysDto,
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

    const variant = await this.productVariantRepository.findById(variantId);
    if (!variant)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
        statusCode: 404,
        message: 'Variant not found',
      });

    for (const key of dto.keys) {
      const variantImage = this.variantImageRepository.create({
        imageKey: key,
        variantId: variant.id,
      });

      await this.variantImageRepository.save(variantImage);
    }
  }
}
