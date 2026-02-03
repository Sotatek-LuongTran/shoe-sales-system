import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryService } from 'src/modules/category/category.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let productRepository: jest.Mocked<ProductRepository>;

  const mockCategoryRepository = {
    findByName: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    getListPagination: jest.fn(),
  };

  const mockProductRepository = {
    findAllByCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: mockCategoryRepository,
        },
        {
          provide: ProductRepository,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get(CategoryRepository);
    productRepository = module.get(ProductRepository);

    jest.clearAllMocks();
  });

  // =========================
  // createCategory
  // =========================
  describe('createCategory', () => {
    it('should create and save a category', async () => {
      const dto = { name: 'Shoes' };

      categoryRepository.findByName.mockResolvedValue(null);
      categoryRepository.create.mockReturnValue(dto as any);
      categoryRepository.save.mockResolvedValue({ id: '1', ...dto } as any);

      const result = await service.createCategory(dto as any);

      expect(categoryRepository.findByName).toHaveBeenCalledWith('Shoes');
      expect(categoryRepository.create).toHaveBeenCalledWith(dto);
      expect(categoryRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Shoes');
    });

    it('should throw if category already exists', async () => {
      categoryRepository.findByName.mockResolvedValue({ id: '1' } as any);

      await expect(
        service.createCategory({ name: 'Shoes' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // =========================
  // updateCategory
  // =========================
  describe('updateCategory', () => {
    it('should update and save category', async () => {
      const category = { id: '1', name: 'Old' };

      categoryRepository.findById.mockResolvedValue(category as any);
      categoryRepository.save.mockResolvedValue({
        ...category,
        name: 'New',
      } as any);

      const result = await service.updateCategory({
        id: '1',
        name: 'New',
      } as any);

      expect(result.name).toBe('New');
    });

    it('should throw if category not found', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateCategory({ id: '1' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =========================
  // deleteCategory
  // =========================
  describe('deleteCategory', () => {
    it('should soft delete category', async () => {
      const category = { id: '1', deletedAt: null };

      categoryRepository.findById.mockResolvedValue(category as any);
      categoryRepository.save.mockResolvedValue({
        ...category,
        deletedAt: new Date(),
      } as any);

      const result = await service.deleteCategory('1');

      expect(result.deletedAt).toBeInstanceOf(Date);
    });

    it('should throw if category not found', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(service.deleteCategory('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =========================
  // getCategorysPagination
  // =========================
  describe('getCategorysPagination', () => {
    it('should return paginated categories', async () => {
      const mockResult = {
        data: [],
        total: 0,
      };

      categoryRepository.getListPagination.mockResolvedValue(
        mockResult as any,
      );

      const result = await service.getCategorysPagination({
        page: 1,
        limit: 10,
      });

      expect(categoryRepository.getListPagination).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  // =========================
  // getProductsBycategory
  // =========================
  describe('getProductsBycategory', () => {
    it('should return products by category', async () => {
      categoryRepository.findById.mockResolvedValue({ id: '1' } as any);
      productRepository.findAllByCategory.mockResolvedValue([
        { id: 'p1' },
      ] as any);

      const result = await service.getProductsBycategory('1');

      expect(result.length).toBe(1);
      expect(productRepository.findAllByCategory).toHaveBeenCalledWith('1');
    });

    it('should throw if category not found', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(
        service.getProductsBycategory('1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =========================
  // getCategory
  // =========================
  describe('getCategory', () => {
    it('should return category', async () => {
      categoryRepository.findById.mockResolvedValue({ id: '1' } as any);

      const result = await service.getCategory('1');

      expect(result.id).toBe('1');
    });

    it('should throw if category not found', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(service.getCategory('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
