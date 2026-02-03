import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from 'src/shared/dto/category/create-category.dto';
import { UpdateCategoryDto } from 'src/shared/dto/category/update-category';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findByName(
      createCategoryDto.name,
    );
    if (existing) throw new BadRequestException('category already exists');

    const category = await this.categoryRepository.create(createCategoryDto);

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
      });
    } catch (error) {
      console.error('Error fetching paginated categorys:', error);
      throw new InternalServerErrorException('Failed to fetch categorys');
    }
  }

  async getCategory(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new NotFoundException('No product found');

    return category;
  }
}
