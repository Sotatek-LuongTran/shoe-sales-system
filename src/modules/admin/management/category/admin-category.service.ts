import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from 'src/modules/admin/management/category/dto/create-category.dto';
import { PaginateCategoriesDto } from 'src/shared/dto/category/paginate-categories.dto';
import { UpdateCategoryDto } from 'src/modules/admin/management/category/dto/update-category.dto';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';
import { AdminCategoryResponseDto } from './dto/admin-category-response.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';

@Injectable()
export class AdminCategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findByName(
      createCategoryDto.name,
    );
    if (existing)
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.CATEGORY_ALREADY_EXIST,
        statusCode: 400,
      });

    const category = this.categoryRepository.create(createCategoryDto);

    await this.categoryRepository.save(category);

    return new AdminCategoryResponseDto(category);
  }

  async updateCategory(updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findById(
      updateCategoryDto.id,
    );
    if (!category)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
        statusCode: 404,
      });

    Object.assign(category, updateCategoryDto);

    await this.categoryRepository.save(category);
    return new AdminCategoryResponseDto(category);
  }

  async deleteCategory(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
        statusCode: 404,
      });

    category.deletedAt = new Date(Date.now());

    await this.categoryRepository.save(category);
  }

  async getCategoriesPagination(dto: PaginateCategoriesDto) {
    dto.includeDeleted = true;
    const categories =
      await this.categoryRepository.findCategoriesPagination(dto);

    return {
      ...categories,
      items: categories.items.map((item) => new AdminCategoryResponseDto(item)),
    };
  }

  async restoreCategory(categoryId: string) {
    const category =
      await this.categoryRepository.findDeletedCategory(categoryId);

    if (!category) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
        statusCode: 404,
      });
    }

    category.deletedAt = null;
    return this.categoryRepository.save(category);
  }
}
