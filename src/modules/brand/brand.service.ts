import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { PaginateBrandsDto } from '../../shared/dto/brand/paginate-brands.dto';
import { BrandResponseDto } from '../../shared/dto/brand/brand-response.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { StorageService } from 'src/shared/modules/storage/storage.service';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly storageService: StorageService,
  ) {}

  async getBrandsPagination(dto: PaginateBrandsDto) {
    const brands = await this.brandRepository.findBrandsPaginationUser(dto);

    const items = await Promise.all(
      brands.items.map(async (brand) => {
        const dto = new BrandResponseDto(brand);
        if (brand.logoKey) {
          dto.logoUrl = await this.storageService.getPresignedSignedUrl(
            brand.logoKey,
          );
        }
        return dto;
      }),
    );
    return {
      items: items,
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

    const dto = new BrandResponseDto(brand);
    if (brand.logoKey) {
      dto.logoUrl = await this.storageService.getPresignedSignedUrl(
        brand.logoKey,
      );
    }
    return dto;
  }
}
