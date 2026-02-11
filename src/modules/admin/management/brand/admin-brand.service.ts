import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from 'src/modules/admin/management/brand/dto/create-brand.dto';
import { PaginateBrandsDto } from 'src/shared/dto/brand/paginate-brands.dto';
import { UpdateBrandDto } from 'src/modules/admin/management/brand/dto/update-brand.dto';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { AdminBrandResponseDto } from './dto/admin-brand-response.dto';

@Injectable()
export class AdminBrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async getBrandsPagination(dto: PaginateBrandsDto) {
    dto.includeDeleted = true;
    const brands = await this.brandRepository.findBrandsPagination(dto);

    return {
      ...brands,
      items: brands.items.map((item) => new AdminBrandResponseDto(item)),
    };
  }

  async createBrand(createBrandDto: CreateBrandDto) {
    const existing = await this.brandRepository.findByName(createBrandDto.name);
    if (existing) throw new BadRequestException('Brand already exists');

    const brand = this.brandRepository.create(createBrandDto);

    await this.brandRepository.save(brand);

    return new AdminBrandResponseDto(brand);
  }

  async updateBrand(updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findById(updateBrandDto.id);
    if (!brand) throw new NotFoundException('Brand not found');

    Object.assign(brand, updateBrandDto);

    await this.brandRepository.save(brand);

    return new AdminBrandResponseDto(brand);
  }

  async deleteBrand(brandId: string) {
    const brand = await this.brandRepository.findById(brandId);
    if (!brand) throw new NotFoundException('No brand found');

    brand.deletedAt = new Date(Date.now());

    await this.brandRepository.save(brand);
  }

  async restoreBrand(brandId: string) {
    const brand = await this.brandRepository.findDeletedBrand(brandId);

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    brand.deletedAt = null;
    await this.brandRepository.save(brand);
    return new AdminBrandResponseDto(brand);
  }
}
