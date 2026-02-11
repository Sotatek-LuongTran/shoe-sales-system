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
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';

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
    if (existing)
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.BRAND_ALREADY_EXIST,
        statusCode: 400,
      });

    const brand = this.brandRepository.create(createBrandDto);

    await this.brandRepository.save(brand);

    return new AdminBrandResponseDto(brand);
  }

  async updateBrand(updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findById(updateBrandDto.id);
    if (!brand)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.BRAND_NOT_FOUND,
        statusCode: 404,
      });

    Object.assign(brand, updateBrandDto);

    await this.brandRepository.save(brand);

    return new AdminBrandResponseDto(brand);
  }

  async deleteBrand(brandId: string) {
    const brand = await this.brandRepository.findById(brandId);
    if (!brand)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.BRAND_NOT_FOUND,
        statusCode: 404,
      });

    brand.deletedAt = new Date(Date.now());

    await this.brandRepository.save(brand);
  }

  async restoreBrand(brandId: string) {
    const brand = await this.brandRepository.findDeletedBrand(brandId);

    if (!brand) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.BRAND_NOT_FOUND,
        statusCode: 404,
      });
    }

    brand.deletedAt = null;
    await this.brandRepository.save(brand);
    return new AdminBrandResponseDto(brand);
  }
}
