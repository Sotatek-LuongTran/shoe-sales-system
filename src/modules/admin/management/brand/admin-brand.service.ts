import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from 'src/modules/admin/management/brand/dto/create-brand.dto';
import { PaginateBrandsDto } from 'src/shared/dto/brand/paginate-brands.dto';
import { UpdateBrandDto } from 'src/modules/admin/management/brand/dto/update-brand.dto';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';

@Injectable()
export class AdminBrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async getBrandsPagination(dto: PaginateBrandsDto) {
    dto.includeDeleted = true;
    return this.brandRepository.findBrandsPagination(dto);
  }

  async createBrand(createBrandDto: CreateBrandDto) {
    const existing = await this.brandRepository.findByName(createBrandDto.name);
    if (existing) throw new BadRequestException('Brand already exists');

    const brand = this.brandRepository.create(createBrandDto);

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
}
