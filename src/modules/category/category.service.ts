import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';
import { PaginateCategoriesDto } from '../../shared/dto/category/paginate-categories.dto';
import { CategoryResponseDto } from '../../shared/dto/category/category-response.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { StorageService } from 'src/shared/modules/storage/storage.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly storageService: StorageService,
  ) {}

  async getCategoriesPagination(dto: PaginateCategoriesDto) {
    const categories =
      await this.categoryRepository.findCategoriesPaginationUser(dto);

    const items = await Promise.all(
      categories.items.map(async (category) => {
        const dto = new CategoryResponseDto(category);
        if (category.logoKey) {
          dto.logoUrl = await this.storageService.getPresignedSignedUrl(
            category.logoKey,
          );
        }
        return dto;
      }),
    );
    return {
      items: items,
      meta: categories.meta,
    };
  }

  async getCategory(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
        statusCode: 404,
        message: 'Category not found',
      });

    const dto = new CategoryResponseDto(category);
    if (category.logoKey) {
      dto.logoUrl = await this.storageService.getPresignedSignedUrl(
        category.logoKey,
      );
    }
    return dto;
  }
}
