import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from 'src/modules/brand/dto/create-brand.dto';
import { UpdateBrandDto } from 'src/modules/brand/dto/update-brand.dto';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { PaginateBrandsDto } from './dto/paginate-brands.dto';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

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

  async getBrandsPagination(dto: PaginateBrandsDto) {
    return this.brandRepository.findBrandsPagination(dto)
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
}
