import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductService } from '../../src/modules/product/product.service';
import { ProductRepository } from '../../src/shared/modules/common-product/product.repository';
import { BrandRepository } from '../../src/shared/modules/common-brand/brand.repository';
import { CategoryRepository } from '../../src/shared/modules/common-category/category.repository';
import { Gender, ProductType } from '../../src/shared/enums/product.enum';


describe('ProductService', () => {
  let service: ProductService;
  let productRepository: jest.Mocked<ProductRepository>;
  let brandRepository: jest.Mocked<BrandRepository>;
  let categoryRepository: jest.Mocked<CategoryRepository>;

  const mockBrand = { id: 'brand-id' } as any;
  const mockCategory = { id: 'category-id' } as any;
  const mockProduct = {
    id: 'product-id',
    name: 'Test Product',
    isActive: true,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findById: jest.fn(),
            getListPagination: jest.fn(),
          },
        },
        {
          provide: BrandRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: CategoryRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get(ProductRepository);
    brandRepository = module.get(BrandRepository);
    categoryRepository = module.get(CategoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- CREATE ----------------

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      brandRepository.findById.mockResolvedValue(mockBrand);
      categoryRepository.findById.mockResolvedValue(mockCategory);
      productRepository.create.mockReturnValue(mockProduct);
      productRepository.save.mockResolvedValue(mockProduct);

      const result = await service.createProduct({
        name: 'Test Product',
        description: 'Desc',
        productType: ProductType.SHOE,
        gender: Gender.UNISEX,
        brandId: mockBrand.id,
        categoryId: mockCategory.id,
      });

      expect(result).toEqual(mockProduct);
      expect(brandRepository.findById).toHaveBeenCalledWith(mockBrand.id);
      expect(categoryRepository.findById).toHaveBeenCalledWith(mockCategory.id);
      expect(productRepository.save).toHaveBeenCalled();
    });

    it('should throw if brand not found', async () => {
      brandRepository.findById.mockResolvedValue(null);

      await expect(
        service.createProduct({
          name: 'Test',
          productType: ProductType.SHOE,
          gender: Gender.UNISEX,
          brandId: 'invalid',
          categoryId: 'cat',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------- UPDATE ----------------

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      brandRepository.findById.mockResolvedValue(mockBrand);
      productRepository.save.mockResolvedValue(mockProduct);

      const result = await service.updateProduct({
        id: 'product-id',
        name: 'Updated Name',
        brandId: mockBrand.id,
      });

      expect(result).toEqual(mockProduct);
      expect(productRepository.save).toHaveBeenCalled();
    });

    it('should throw if product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateProduct({id: 'invalid-id'}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------- GET ONE ----------------

  describe('getProduct', () => {
    it('should return product', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.getProduct('product-id');
      expect(result).toEqual(mockProduct);
    });

    it('should throw if not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(service.getProduct('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------------- PAGINATION ----------------

  describe('getProductsPagination', () => {
    it('should return paginated products', async () => {
      productRepository.getListPagination.mockResolvedValue({
        data: [mockProduct],
        total: 1,
      } as any);

      const result = await service.getProductsPagination({
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(1);
      expect(productRepository.getListPagination).toHaveBeenCalled();
    });
  });

  // ---------------- DELETE ----------------

  describe('deleteProduct', () => {
    it('should soft delete product', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.create.mockReturnValue({
        ...mockProduct,
        deletedAt: new Date(),
      });
      productRepository.save.mockResolvedValue({
        ...mockProduct,
        deletedAt: new Date(),
      });

      const result = await service.deleteProduct('product-id');

      expect(productRepository.save).toHaveBeenCalled();
      expect(result.deletedAt).toBeDefined();
    });

    it('should throw if product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(service.deleteProduct('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
