import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { PaginateBrandsDto } from '../../shared/dto/brand/paginate-brands.dto';
import { BrandResponseDto } from '../../shared/dto/brand/brand-response.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async getBrandsPagination(dto: PaginateBrandsDto) {
    const brands = await this.brandRepository.findBrandsPagination(dto);

    return {
      ...brands,
      items: brands.items.map((brand) => new BrandResponseDto(brand)),
    };
  }

  async getBrand(brandId: string) {
    const brand = await this.brandRepository.findById(brandId);
    if (!brand)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.BRAND_NOT_FOUND,
        statusCode: 404,
      });

    return new BrandResponseDto(brand);
  }
}
