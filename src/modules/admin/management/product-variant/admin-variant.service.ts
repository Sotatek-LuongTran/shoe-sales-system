import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVariantDto } from 'src/modules/admin/management/product-variant/dto/create-variant.dto';
import { PaginateVariantsDto } from 'src/shared/dto/product-variant/paginate-variants.dto';
import { UpdateVariantDto } from 'src/modules/admin/management/product-variant/dto/update-vatiant.dto';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';

@Injectable()
export class AdminProductVariantService {
  constructor(
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async createProductVariant(createVariantDto: CreateVariantDto) {
    const product = await this.productRepository.findById(
      createVariantDto.productId,
    );
    if (!product) throw new NotFoundException('Product not found');

    const variant = this.productVariantRepository.create({
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

    Object.assign(variant, UpdateVariantDto);

    return this.productVariantRepository.save(variant);
  }

  async deleteProductVariant(id: string) {
    const variant = await this.productVariantRepository.findById(id);
    if (!variant) throw new NotFoundException('Product variant not found');

    variant.deletedAt = new Date(Date.now());

    return this.productVariantRepository.save(variant);
  }

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

  async restoreProductVariant(variantId: string) {
    const variant = await this.productVariantRepository.findOne({
      where: { id: variantId },
      withDeleted: true,
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    variant.deletedAt = null;
    return this.productVariantRepository.save(variant);
  }

  async removeSoftDeletedVariants() {
    await this.productVariantRepository.removeSoftDeletedVariants();
  }
}
