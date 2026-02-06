import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from 'src/shared/dto/category/create-category.dto';
import { UpdateCategoryDto } from 'src/shared/dto/category/update-category';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findByName(
      createCategoryDto.name,
    );
    if (existing) throw new BadRequestException('Category already exists');

    const category = await this.categoryRepository.create(createCategoryDto);

    return this.categoryRepository.save(category);
  }

  async updateCategory(updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findById(
      updateCategoryDto.id,
    );
    if (!category) throw new NotFoundException('category not found');

    if (category.deletedAt) {
      throw new BadRequestException('Category currently unavailable');
    }

    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async deleteCategory(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new NotFoundException('No product found');

    if (category.deletedAt) {
      throw new BadRequestException('Category has already been deleted');
    }

    category.deletedAt = new Date(Date.now());

    return this.categoryRepository.save(category);
  }

  async getCategorysPagination(options: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, any>;
  }) {
    try {
      return this.categoryRepository.getListPagination({
        page: options.page,
        limit: options.limit,
        search: options.search,
        searchFields: ['name', 'description'],
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        filters: {
          deletedAt: null,
        },
      });
    } catch (error) {
      console.error('Error fetching paginated categories:', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async getCategory(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new NotFoundException('No product found');

    return category;
  }

  async restoreCategory(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.deletedAt) {
      throw new BadRequestException('Category is not deleted');
    }

    category.deletedAt = null;
    return this.categoryRepository.save(category);
  }

  async getSoftDeletedCategoriesPagination(options: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      return this.categoryRepository.findSoftDeletedCategories(options);
    } catch (error) {
      console.error('Error fetching paginated categories:', error);
      throw new InternalServerErrorException(
        'Failed to fetch categories',
      );
    }
  }

  async removeOneSoftDeletedCategory(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.deletedAt) {
      throw new BadRequestException(
        'Category must be soft deleted before permanent removal',
      );
    }

    await this.categoryRepository.removeOneSoftDeletedCategory(categoryId);

    return {
      message: 'Category permanently deleted',
      categoryId,
    };
  }

  async removeSoftDeletedCategories() {
    const categories = await this.categoryRepository.findSoftDeletedCategories({});
    if (!categories.data.length) {
      throw new NotFoundException('The list is empty');
    }

    await this.categoryRepository.removeSoftDeletedCategories();
    return {
      message: 'Categories permanently deleted'
    }
  }
}
