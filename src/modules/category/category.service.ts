import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';
import { PaginateCategoriesDto } from '../../shared/dto/category/paginate-categories.dto';
import { CategoryResponseDto } from '../../shared/dto/category/category-response.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getCategoriesPagination(dto: PaginateCategoriesDto) {
    const categories = await this.categoryRepository.findCategoriesPagination(dto);

    return {
      ...categories,
      items: categories.items.map(
        category => new CategoryResponseDto(category),
      ),
    }
  }

  async getCategory(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new NotFoundException('No product found');

    return new CategoryResponseDto(category);
  }
}
