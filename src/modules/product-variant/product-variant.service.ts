import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVariantDto } from 'src/shared/dto/product-variant/create-variant.dto';
import { UpdateVariantDto } from 'src/shared/dto/product-variant/update-vatiant.dto';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';

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

    const variant = this.productVariantRepository.create({
      variantValue: createVariantDto.variantValue,
      price: createVariantDto.price,
      stock: createVariantDto.stock,
      product: product,
      isActive: true,
    });

    return variant;
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

  async getVariantsByProduct(
    productId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
  ) {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  
    return this.productVariantRepository.getListPagination({
      page: options?.page,
      limit: options?.limit,
      search: options?.search,
      searchFields: ['name', 'price', 'stock'],
      sortBy: options?.sortBy ?? 'createdAt',
      sortOrder: options?.sortOrder ?? 'DESC',
      additionalWhere: {
        product: { id: productId } as any,
      },
      relations: ['product'],
    });
  }
  
  async getProductVariant(id: string) {
    const variant = await this.productVariantRepository.findById(id);
    if (!variant) throw new NotFoundException('Product variant not found');

    return variant;
  }
}
