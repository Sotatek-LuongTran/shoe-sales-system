import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { PaginateBrandsDto } from '../admin/management/brand/dto/paginate-brands.dto';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async getBrandsPagination(dto: PaginateBrandsDto) {
    return this.brandRepository.findBrandsPagination(dto)
  }

  async getBrand(brandId: string) {
    const brand = await this.brandRepository.findById(brandId);
    if (!brand) throw new NotFoundException('No brand found');

    return brand;
  }
}
