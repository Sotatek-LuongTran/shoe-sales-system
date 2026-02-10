import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from 'src/modules/category/dto/create-category.dto';
import { PaginateCategoriesDto } from 'src/modules/category/dto/paginate-categories.dto';
import { UpdateCategoryDto } from 'src/modules/category/dto/update-category';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';

@Injectable()
export class AdminCategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findByName(
      createCategoryDto.name,
    );
    if (existing) throw new BadRequestException('Category already exists');

    const category = this.categoryRepository.create(createCategoryDto);

    return this.categoryRepository.save(category);
  }

  async updateCategory(updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findById(
      updateCategoryDto.id,
    );
    if (!category) throw new NotFoundException('category not found');

    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async deleteCategory(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new NotFoundException('No product found');

    category.deletedAt = new Date(Date.now());

    return this.categoryRepository.save(category);
  }

  async getCategoriesPagination(dto: PaginateCategoriesDto) {
    dto.includeDeleted = true;
    return this.categoryRepository.findCategoriesPagination(dto);
  }

  async restoreCategory(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    category.deletedAt = null;
    return this.categoryRepository.save(category);
  }
}
