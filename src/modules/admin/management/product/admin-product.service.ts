import { Injectable, NotFoundException } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ProductEntity } from 'src/database/entities/product.entity';
import { CreateProductDto } from 'src/modules/admin/management/product/dto/create-product.dto';
import { PaginateProductsDto } from 'src/modules/admin/management/product/dto/paginate-products.dto';
import { UpdateProductDto } from 'src/modules/admin/management/product/dto/update-product.dto';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';

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
      throw new NotFoundException('Brand not exists');
    }

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not exists');
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

    return this.productRepository.save(product);
  }

  async updateProduct(dto: UpdateProductDto): Promise<ProductEntity> {
    const product = await this.productRepository.findById(dto.id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.brandId) {
      const brand = await this.brandRepository.findById(dto.brandId);
      if (!brand) throw new NotFoundException('Brand not exists');
    }

    if (dto.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) throw new NotFoundException('Category not exists');
    }

    Object.assign(product, dto);

    return this.productRepository.save(product);
  }

  async getProductsPagination(
    dto: PaginateProductsDto,
  ): Promise<Pagination<ProductEntity>> {
    dto.includeDeleted = true;
    return this.productRepository.findProductsPagination(dto);
  }

  async getProduct(id: string) {
    const product = await this.productRepository.findProductWithPriceRange(id);

    if (!product.entities.length) {
      throw new NotFoundException('No product found');
    }

    return {
      ...product.entities[0],
      priceRange: {
        min: Number(product.raw[0].minprice),
        max: Number(product.raw[0].maxprice),
      },
    };
  }

  async deleteProduct(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('No product found');
    }

    product.deletedAt = new Date(); // or new Date(Date.now())

    return this.productRepository.save(product);
  }

  async restoreProduct(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      withDeleted: true,
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.deletedAt = null;

    // Optional: restore variants too
    for (const variant of product.variants) {
      if (variant.deletedAt) {
        variant.deletedAt = null;
      }
    }

    return this.productRepository.save(product);
  }

  async removeSoftDeletedProducts() {
    await this.productRepository.removeSoftDeletedProducts();
  }
}
