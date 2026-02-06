import {
  BadRequestException,
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
    if (brand.deletedAt) {
      throw new NotFoundException('Brand currently unavailable');
    }

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not exists');
    }
    if (category.deletedAt) {
      throw new NotFoundException('Category currently unavailable');
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

  async updateProduct(dto: UpdateProductDto): Promise<ProductEntity> {
    const product = await this.productRepository.findById(dto.id);

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

  async getActiveProductsPagination(options: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
      gender?: string;
      productType?: string;
      brandId?: string;
      categoryId?: string;
      isActive?: boolean;
      minPrice?: number;
      maxPrice?: number;
    };
  }) {
    try {
      return this.productRepository.findProductsPaginationWithPriceRange({
        page: options.page,
        limit: options.limit,
        search: options.search,
        filters: {
          ...options.filters,
          isActive: options.filters?.isActive ?? true,
        },
      });
    } catch (error) {
      console.error('Error fetching paginated products:', error);
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async getProductsPagination(options: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
      gender?: string;
      productType?: string;
      brandId?: string;
      categoryId?: string;
      isActive?: boolean;
      minPrice?: number;
      maxPrice?: number;
    };
  }) {
    try {
      return this.productRepository.getListPagination({
        page: options.page,
        limit: options.limit,
        search: options.search,
        filters: {
          ...options.filters,
        },
      });
    } catch (error) {
      console.error('Error fetching paginated products:', error);
      throw new InternalServerErrorException('Failed to fetch products');
    }
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

  async getProductsByCategory(
    categoryId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
    },
  ) {
    // Validate category existence (cheap + clear error)
    const exists = await this.categoryRepository.findById(categoryId);
    if (!exists) {
      throw new NotFoundException('Category not found');
    }

    return this.productRepository.findProductsPaginationWithPriceRange({
      page: options?.page,
      limit: options?.limit,
      search: options?.search,
      filters: {
        categoryId,
        minPrice: options?.minPrice,
        maxPrice: options?.maxPrice,
        isActive: true,
      },
    });
  }

  async getProductsByBrand(
    brandId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
    },
  ) {
    const exists = await this.brandRepository.findById(brandId);
    if (!exists) {
      throw new NotFoundException('Brand not found');
    }

    return this.productRepository.findProductsPaginationWithPriceRange({
      page: options?.page,
      limit: options?.limit,
      search: options?.search,
      filters: {
        brandId,
        minPrice: options?.minPrice,
        maxPrice: options?.maxPrice,
        isActive: true,
      },
    });
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

    if (!product.deletedAt) {
      throw new BadRequestException('Product is not deleted');
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

  async getSoftDeletedProductsPagination(options: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      return this.productRepository.findSoftDeletedProducts(options);
    } catch (error) {
      console.error('Error fetching paginated products:', error);
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async removeOneSoftDeletedProduct(productId: string) {
    const product = await this.productRepository.findById(productId);

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

  async removeSoftDeletedProducts() {
    const products = await this.productRepository.findSoftDeletedProducts({})
    if (!products.data.length) {
      throw new NotFoundException('The list is empty')
    }

    await this.productRepository.removeSoftDeletedProducts()
    return {
      message: 'Products permanently deleted'
    }
  }
}
