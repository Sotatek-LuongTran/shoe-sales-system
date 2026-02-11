import { Injectable, NotFoundException } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ProductEntity } from 'src/database/entities/product.entity';
import { CreateProductDto } from 'src/modules/admin/management/product/dto/create-product.dto';
import { PaginateProductsDto } from 'src/shared/dto/product/paginate-products.dto';
import { UpdateProductDto } from 'src/modules/admin/management/product/dto/update-product.dto';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { AdminProductResponseDto } from './dto/admin-product-response.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';

@Injectable()
export class AdminProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly brandRepository: BrandRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async createProduct(createProductDto: CreateProductDto) {
    const { name, description, productType, gender, brandId, categoryId } =
      createProductDto;

    const brand = await this.brandRepository.findById(brandId);
    if (!brand) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.BRAND_NOT_FOUND,
        statusCode: 404
      });
    }

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
        statusCode: 404
      });
    }

    const product = this.productRepository.create({
      name,
      description,
      productType,
      gender,
      brand: brand,
      category: category,
      isActive: true,
    });

    await this.productRepository.save(product);
    return new AdminProductResponseDto(product);
  }

  async updateProduct(dto: UpdateProductDto) {
    const product = await this.productRepository.findById(dto.id);

    if (!product) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_NOT_FOUND,
        statusCode: 404
      });
    }

    if (dto.brandId) {
      const brand = await this.brandRepository.findById(dto.brandId);
      if (!brand) throw new NotFoundException({
        errorCode: ErrorCodeEnum.BRAND_NOT_FOUND,
        statusCode: 404
      });
    }

    if (dto.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) throw new NotFoundException({
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
        statusCode: 404
      });
    }

    Object.assign(product, dto);

    await this.productRepository.save(product);
    return new AdminProductResponseDto(product);
  }

  async getProductsPagination(
    dto: PaginateProductsDto,
  ) {
    dto.includeDeleted = true;
    const products = await this.productRepository.findProductsPagination(dto);
    return {
      ...products,
      items: products.items.map((item) => new AdminProductResponseDto(item)),
    };
  }

  async getProduct(id: string) {
    const product = await this.productRepository.findProductWithVariants(id);

    if (!product) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_NOT_FOUND,
        statusCode: 404
      });
    }

    return new AdminProductResponseDto(product);
  }

  async deleteProduct(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_NOT_FOUND,
        statusCode: 404
      });
    }

    product.deletedAt = new Date(); // or new Date(Date.now())

    await this.productRepository.save(product);
  }

  async restoreProduct(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      withDeleted: true,
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_NOT_FOUND,
        statusCode: 404
      });
    }

    product.deletedAt = null;

    // Optional: restore variants too
    for (const variant of product.variants) {
      if (variant.deletedAt) {
        variant.deletedAt = null;
      }
    }

    await this.productRepository.save(product);
    return new AdminProductResponseDto(product);
  }

  async removeSoftDeletedProducts() {
    await this.productRepository.removeSoftDeletedProducts();
  }
}
