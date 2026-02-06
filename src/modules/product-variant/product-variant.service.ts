import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateVariantDto } from 'src/shared/dto/product-variant/create-variant.dto';
import { UpdateVariantDto } from 'src/shared/dto/product-variant/update-vatiant.dto';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class ProductVariantService {
  constructor(
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async createProductVariant(createVariantDto: CreateVariantDto) {
    const product = await this.productRepository.findById(
      createVariantDto.productId,
    );
    if (!product) throw new NotFoundException('Product not found');

    if (product.deletedAt) {
      throw new NotFoundException('Product variant currently unavailable');
    }

    const variant = await this.productVariantRepository.create({
      variantValue: createVariantDto.variantValue,
      price: createVariantDto.price,
      stock: createVariantDto.stock,
      product: product,
      isActive: true,
    });

    return this.productVariantRepository.save(variant);
  }

  async updateProductVariant(updateVariantDto: UpdateVariantDto) {
    const variant = await this.productVariantRepository.findById(
      updateVariantDto.id,
    );
    if (!variant) throw new NotFoundException('Product variant not found');

    if (variant.deletedAt) {
      throw new NotFoundException('Product variant currently unavailable');
    }

    Object.assign(variant, UpdateVariantDto);

    return this.productVariantRepository.save(variant);
  }

  async deleteProductVariant(id: string) {
    const variant = await this.productVariantRepository.findById(id);
    if (!variant) throw new NotFoundException('Product variant not found');
    if (variant.deletedAt) {
      throw new BadRequestException('Product variant has already unactivated');
    }

    variant.deletedAt = new Date(Date.now());

    return this.productVariantRepository.save(variant);
  }

  async getVariantsByProduct(
    productId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      minPrice?: number;
      maxPrice?: number;
      minStock?: number;
    },
  ) {
    const product =
      await this.productRepository.findOneWithBrandAndCategory(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.brand?.deletedAt) {
      throw new NotFoundException('Product brand is unavailable');
    }

    if (product.category?.deletedAt) {
      throw new NotFoundException('Product category is unavailable');
    }

    return this.productVariantRepository.getListPagination({
      page: options?.page,
      limit: options?.limit,
      search: options?.search,
      searchFields: ['variantValue'],
      sortBy: options?.sortBy ?? 'createdAt',
      sortOrder: options?.sortOrder ?? 'DESC',
      additionalWhere: {
        productId,
      },
      filters: {
        deletedAt: null,
      },
    });
  }

  async getProductVariant(id: string) {
    const variant = await this.productVariantRepository.findById(id);
    if (!variant) throw new NotFoundException('Product variant not found');

    if (variant.deletedAt) {
      throw new NotFoundException('Product variant currently unavailable');
    }

    return variant;
  }

  async restoreProductVariant(variantId: string) {
    const variant = await this.productVariantRepository.findOne({
      where: { id: variantId },
      withDeleted: true,
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (!variant.deletedAt) {
      throw new BadRequestException('Product variant is not deleted');
    }

    variant.deletedAt = null;
    return this.productVariantRepository.save(variant);
  }

  async getSoftDeletedVariantsPagination(options: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      return this.productVariantRepository.findSoftDeletedVariants(options);
    } catch (error) {
      console.error('Error fetching paginated product variants:', error);
      throw new InternalServerErrorException('Failed to fetch product variants');
    }
  }

  async removeOneSoftDeletedVariant(productId: string) {
    const product = await this.productVariantRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.deletedAt) {
      throw new BadRequestException(
        'Product must be soft deleted before permanent removal',
      );
    }

    await this.productRepository.delete(productId);

    return {
      message: 'Product permanently deleted',
      productId,
    };
  }

  async removeSoftDeletedVariants() {
    const variants = await this.productVariantRepository.findSoftDeletedVariants({});
    if (!variants.data.length) {
      throw new NotFoundException('The list is empty');
    }

    await this.productVariantRepository.removeSoftDeletedVariants();
    return {
      message: 'Variants permanently deleted'
    }
  }
}
