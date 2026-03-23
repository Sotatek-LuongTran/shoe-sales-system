import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from 'src/modules/admin/management/category/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/modules/admin/management/category/dto/update-category.dto';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';
import { AdminCategoryResponseDto } from './dto/admin-category-response.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { CategoryStatusEnum } from 'src/shared/enums/category.enum';
import { AdminPaginateCategoriesDto } from './dto/admin-paginate-category.dto';

@Injectable()
export class AdminCategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findByName(
      createCategoryDto.name,
    );
    if (existing)
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.CATEGORY_ALREADY_EXIST,
        statusCode: 400,
        message: 'Category has already existed',
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
        message: 'Category not found',
      });

    Object.assign(category, updateCategoryDto);

    await this.categoryRepository.save(category);
  }

  async deleteCategory(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
        statusCode: 404,
        message: 'Category not found',
      });

    category.deletedAt = new Date(Date.now());

    await this.categoryRepository.save(category);
  }

  async getCategoriesPagination(dto: AdminPaginateCategoriesDto) {
    const categories =
      await this.categoryRepository.findCategoriesPaginationAdmin(dto);
    return {
      data: categories.items.map((item) => new AdminCategoryResponseDto(item)),
      meta: categories.meta,
    };
  }

  async deactivateCategory(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
        statusCode: 404,
        message: 'Category not found',
      });

    category.status = CategoryStatusEnum.INACTIVE;

    await this.categoryRepository.save(category);
  }

  async restoreCategory(categoryId: string) {
    const category =
      await this.categoryRepository.findInactiveCategory(categoryId);

    if (!category) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
        statusCode: 404,
        message: 'Category not found',
      });
    }

    category.status = CategoryStatusEnum.ACTIVE;
    return this.categoryRepository.save(category);
  }

  // async uploadCategoryLogo(categoryId: string, file: Express.Multer.File) {
  //   const category =
  //     await this.categoryRepository.findInactiveCategory(categoryId);

  //   if (!category) {
  //     throw new NotFoundException({
  //       errorCode: ErrorCodeEnum.BRAND_NOT_FOUND,
  //       statusCode: 404,
  //       message: 'Category not found',
  //     });
  //   }

  //   const uploadedResult = await this.storageService.uploadSingleFile(file);

  //   category.logoKey = uploadedResult.key;

  //   await this.categoryRepository.save(category);

  //   return { url: uploadedResult.url };
  // }
}
