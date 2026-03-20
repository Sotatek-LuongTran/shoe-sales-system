import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { PaginateBrandsDto } from '../../shared/dto/brand/paginate-brands.dto';
import { BrandResponseDto } from '../../shared/dto/brand/brand-response.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
  ) {}

  async getBrandsPagination(dto: PaginateBrandsDto) {
    const brands = await this.brandRepository.findBrandsPaginationUser(dto);
    return {
      data: brands.items.map(item => new BrandResponseDto(item)),
      meta: brands.meta,
    };
  }

  async getBrand(brandId: string) {
    const brand = await this.brandRepository.findById(brandId);
    if (!brand)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.BRAND_NOT_FOUND,
        statusCode: 404,
        message: 'Brand not found',
      });

    return new BrandResponseDto(brand);
  }
}
