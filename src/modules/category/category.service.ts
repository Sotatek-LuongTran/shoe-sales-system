import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';
import { PaginateCategoriesDto } from './dto/paginate-categories.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getCategoriesPagination(dto: PaginateCategoriesDto) {
      return this.categoryRepository.findCategoriesPagination(dto)
  }

  async getCategory(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new NotFoundException('No product found');

    return category;
  }
}
