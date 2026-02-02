import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from 'src/shared/dto/brand/create-brand.dto';
import { UpdateBrandDto } from 'src/shared/dto/brand/update-brand.dto';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly productRepository: ProductRepository,
) {}

  async createBrand(createBrandDto: CreateBrandDto) {
    const existing = await this.brandRepository.findByName(createBrandDto.name);
    if (existing) throw new BadRequestException('Brand already exists');

    const brand = await this.brandRepository.create(createBrandDto);

    return this.brandRepository.save(brand);
  }

  async updateBrand(updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findById(updateBrandDto.id);
    if (!brand) throw new NotFoundException('Brand not found');

    Object.assign(brand, updateBrandDto);

    return this.brandRepository.save(brand);
  }

  async deleteBrand(brandId: string) {
    const brand = await this.brandRepository.findById(brandId);
    if (!brand) throw new NotFoundException('No product found');

    brand.deletedAt = new Date(Date.now());

    return this.brandRepository.save(brand);
  }

  async getBrandsPagination(options: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, any>;
  }) {
    try {
      return this.brandRepository.getListPagination({
        page: options.page,
        limit: options.limit,
        search: options.search,
        searchFields: ['name', 'description'],
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
    } catch (error) {
      console.error('Error fetching paginated brands:', error);
      throw new InternalServerErrorException('Failed to fetch brands');
    }
  }

  async getProductsByBrand(brandId: string) {
    const brand = await this.brandRepository.findById(brandId);
    if (!brand) throw new NotFoundException('No product found');

    const products = await this.productRepository.findAllByBrand(brandId);

    return products;
  }

  async getBrand(brandId: string) {
    const brand = await this.brandRepository.findById(brandId);
    if (!brand) throw new NotFoundException('No product found');

    return brand;
  }
}
