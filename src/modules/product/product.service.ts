import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProductEntity } from 'src/database/entities/product.entity';
import { CreateProductDto } from 'src/shared/dto/product/create-product.dto';
import { UpdateProductDto } from 'src/shared/dto/product/update-product.dto';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';

@Injectable()
export class ProductService {
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

    const product = await this.productRepository.create({
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

  async updateProduct(
    productId: string,
    dto: UpdateProductDto,
  ): Promise<ProductEntity> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.brandId) {
      const brand = await this.brandRepository.findById(dto.brandId);
      if (!brand) throw new NotFoundException('Brand not exists');
      product.brand = brand;
    }

    if (dto.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) throw new NotFoundException('Category not exists');
      product.category = category;
    }

    Object.assign(product, dto);

    return this.productRepository.save(product);
  }

  async getProductsPagination(options: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, any>;
  }) {
    try {
      return this.productRepository.getListPagination({
        page: options.page,
        limit: options.limit,
        search: options.search,
        searchFields: ['name', 'description'],
        filters: {
          gender: options.filters?.gender,
          productType: options.filters?.productType,
          brandId: options.filters?.brandId,
          categoryId: options.filters?.categoryId,
          isActive: options.filters?.isActive ?? true,
        },
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
    } catch (error) {
      console.error('Error fetching paginated products:', error);
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async getProduct(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('No product found');
    }
    return product;
  }

  async deleteProduct(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('No product found');
    }

    const deletedProduct = await this.productRepository.create({
      ...product,
      deletedAt: Date.now(),
    });

    return this.productRepository.save(deletedProduct)
  }
}
