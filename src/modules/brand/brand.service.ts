import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { PaginateBrandsDto } from '../../shared/dto/brand/paginate-brands.dto';
import { BrandResponseDto } from '../../shared/dto/brand/brand-response.dto';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async getBrandsPagination(dto: PaginateBrandsDto) {
    const brands = await this.brandRepository.findBrandsPagination(dto)

    return {
      ...brands,
      items: brands.items.map(
        brand => new BrandResponseDto(brand),
      ),
    };
  }

  async getBrand(brandId: string) {
    const brand = await this.brandRepository.findById(brandId);
    if (!brand) throw new NotFoundException('No brand found');

    return new BrandResponseDto(brand);
  }
}
