import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from 'src/modules/brand/dto/create-brand.dto';
import { UpdateBrandDto } from 'src/modules/brand/dto/update-brand.dto';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

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
    if (!brand) throw new NotFoundException('No brand found');

    brand.deletedAt = new Date(Date.now());

    return this.brandRepository.save(brand);
  }

  async getBrandsPagination(options: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, any>;
  }) {
      return this.brandRepository.getListPagination({
        page: options.page,
        limit: options.limit,
        search: options.search,
        searchFields: ['name', 'description'],
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        filters: {
          deletedAt: null,
        },
      });
  }

  async getBrand(brandId: string) {
    const brand = await this.brandRepository.findById(brandId);
    if (!brand) throw new NotFoundException('No brand found');

    return brand;
  }

  async restoreBrand(brandId: string) {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
      withDeleted: true,
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    brand.deletedAt = null;
    return this.brandRepository.save(brand);
  }

  async getSoftDeletedBrandsPagination(options: {
    page?: number;
    limit?: number;
    search?: string;
  }) {

      return this.brandRepository.findSoftDeletedBrands(options);
  }

  async removeOneSoftDeletedBrand(brandId: string) {
    const brand = await this.brandRepository.findById(brandId);

    if (!brand) {
      throw new NotFoundException('Category not found');
    }

    await this.brandRepository.removeOneSoftDeletedBrand(brandId);

    return {
      message: 'Category permanently deleted',
      brandId,
    };
  }

  async removeSoftDeletedBrands() {
    const brands = await this.brandRepository.findSoftDeletedBrands(
      {},
    );
    if (!brands.data.length) {
      throw new NotFoundException('The list is empty');
    }

    await this.brandRepository.removeSoftDeletedBrands();
    return {
      message: 'Brands permanently deleted'
    }
  }
}
