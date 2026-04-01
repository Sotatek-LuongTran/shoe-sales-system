import { Test } from '@nestjs/testing';
import { AdminProductService } from './admin-product.service';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';
import { NotFoundException } from '@nestjs/common';
import {
  GenderEnum,
  ProductStatusEnum,
  ProductTypeEnum,
} from 'src/shared/enums/product.enum';
import { VariantStatusEnum } from 'src/shared/enums/product-variant.enum';

describe('AdminProductService', () => {
  let service: AdminProductService;
  let productRepo: any;
  let brandRepo: any;
  let categoryRepo: any;

  beforeEach(async () => {
    productRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findProductsPaginationAdmin: jest.fn(),
      findProductWithVariants: jest.fn(),
      findInactiveProduct: jest.fn(),
      removeSoftDeletedProducts: jest.fn(),
    };

    brandRepo = {
      findById: jest.fn(),
    };

    categoryRepo = {
      findById: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AdminProductService,
        { provide: ProductRepository, useValue: productRepo },
        { provide: BrandRepository, useValue: brandRepo },
        { provide: CategoryRepository, useValue: categoryRepo },
      ],
    }).compile();

    service = module.get<AdminProductService>(AdminProductService);
  });

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const dto = {
        id: 'product-1',
        name: 'Nike shoe',
        brandId: 'brand-1',
        categoryId: 'category-1',
        gender: GenderEnum.UNISEX,
        productType: ProductTypeEnum.SHOE,
      };
      const product = {
        ...dto,
        brand: { id: 'brand-1' },
        category: { id: 'category-1' },
        description: undefined,
        status: ProductStatusEnum.ACTIVE,
      };

      const brand = {
        id: 'brand-1',
      };
      const category = {
        id: 'category-1',
      };

      brandRepo.findById.mockResolvedValue(brand);
      categoryRepo.findById.mockResolvedValue(category);
      productRepo.create.mockReturnValue(product);
      productRepo.save.mockResolvedValue(product);

      const result = await service.createProduct(dto as any);

      expect(brandRepo.findById).toHaveBeenCalledWith(dto.brandId);
      expect(categoryRepo.findById).toHaveBeenCalledWith(dto.categoryId);
      expect(productRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          gender: dto.gender,
          productType: dto.productType,
          brand,
          category,
        }),
      );
      expect(productRepo.save).toHaveBeenCalledWith(product);
      expect(result).toBeDefined();
    });

    it('should throw brand not found', async () => {
      brandRepo.findById.mockResolvedValue(null);
      await expect(
        service.createProduct({
          brandId: 'null',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw category not found', async () => {
      categoryRepo.findById.mockResolvedValue(null);
      await expect(
        service.createProduct({
          categoryId: 'null',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProduct', () => {
    it('should update product succesfully', async () => {
      const dto = {
        id: 'pruduct-1',
        name: 'Nike 2',
        brandId: 'brand-2',
        categoryId: 'category-2',
      };
      const product = {
        id: 'product-1',
        name: 'Nike 1',
        brandId: 'brand-1',
        categoryId: 'category-1',
      };

      brandRepo.findById.mockResolvedValue({
        id: 'brand-2',
      });
      categoryRepo.findById.mockResolvedValue({
        id: 'category-2',
      });
      productRepo.findById.mockResolvedValue(product);
      productRepo.save.mockResolvedValue(undefined);

      await service.updateProduct(dto);

      expect(productRepo.findById).toHaveBeenCalledWith(dto.id);
      expect(brandRepo.findById).toHaveBeenCalledWith(dto.brandId);
      expect(categoryRepo.findById).toHaveBeenCalledWith(dto.categoryId);
      expect(productRepo.save).toHaveBeenCalledWith(product);
    });
    it('should throw product not found', async () => {
      productRepo.findById.mockResolvedValue(null);
      await expect(
        service.updateProduct({
          id: 'null',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw brand not found', async () => {
      brandRepo.findById.mockResolvedValue(null);
      await expect(
        service.updateProduct({
          brandId: 'null',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw category not found', async () => {
      categoryRepo.findById.mockResolvedValue(null);
      await expect(
        service.updateProduct({
          categoryId: 'null',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProductsPagination', () => {
    it('should get products successfully', async () => {
      const products = {
        items: [
          {
            id: 'product-1',
            brandId: 'brand-1',
            categoryId: 'category-1',
            gender: GenderEnum.UNISEX,
            productType: ProductTypeEnum.SHOE,
            variants: [
              {
                id: 'variant-1',
                images: [
                  {
                    imageKeys: ['avatar/1/1'],
                  },
                ],
              },
            ],
          },
          {
            id: 'product-2',
            brandId: 'brand-1',
            categoryId: 'category-1',
            gender: GenderEnum.UNISEX,
            productType: ProductTypeEnum.SHOE,
            variants: [
              {
                id: 'variant-2',
                images: [
                  {
                    imageKeys: ['avatar/2/2'],
                  },
                ],
              },
            ],
          },
        ],
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      productRepo.findProductsPaginationAdmin.mockResolvedValue(products);

      const result = await service.getProductsPagination({});

      expect(result).toBeDefined();
      expect(result.meta).toEqual(products.meta);
      expect(result.data.length).toBe(2);
    });
  });

  describe('getProduct', () => {
    it('should get product successfully', async () => {
      const product = {
        id: 'product-1',
        variants: [
          {
            id: 'variant-1',
            images: [],
          },
        ],
      };

      productRepo.findProductWithVariants.mockResolvedValue(product);

      const result = await service.getProduct(product.id);
      expect(productRepo.findProductWithVariants).toHaveBeenCalledWith(
        product.id,
      );
      expect(result).toBeDefined();
    });

    it('should throw product not found', async () => {
      productRepo.findProductWithVariants.mockResolvedValue(null);
      await expect(service.getProduct('wrong-product')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const product = {
        id: 'product-1',
      };
      productRepo.findById.mockResolvedValue(product);
      productRepo.save.mockResolvedValue(undefined);
      await service.deleteProduct(product.id);

      expect(productRepo.findById).toHaveBeenCalledWith(product.id);
      expect(productRepo.save).toHaveBeenCalledWith(product);
    });
    it('should throw product not found', async () => {
      productRepo.findById.mockResolvedValue(null);
      await expect(service.deleteProduct('wrong-product')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deactivateProduct', () => {
    it('should deactivate product successfully', async () => {
      const product = {
        id: 'product-1',
        status: ProductStatusEnum.ACTIVE,
        variants: [
          {
            id: 'variant-1',
            status: VariantStatusEnum.ACTIVE,
          },
        ],
      };
      productRepo.findById.mockResolvedValue(product);
      productRepo.save.mockResolvedValue(undefined);
      await service.deactivateProduct(product.id);

      expect(productRepo.findById).toHaveBeenCalledWith(product.id);
      expect(productRepo.save).toHaveBeenCalledWith(product);
      expect(product.status).toBe(ProductStatusEnum.INACTIVE);
      expect(product.variants[0].status).toBe(VariantStatusEnum.INACTIVE);
    });
    it('should throw product not found', async () => {
      productRepo.findById.mockResolvedValue(null);
      await expect(service.deactivateProduct('wrong-product')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restoreProduct', () => {
    it('should restore product successfully', async () => {
      const product = {
        id: 'product-1',
        status: ProductStatusEnum.INACTIVE,
        variants: [
          {
            id: 'variant-1',
            status: VariantStatusEnum.INACTIVE,
          },
        ],
      };

      productRepo.findInactiveProduct.mockResolvedValue(product);
      productRepo.save.mockResolvedValue(undefined);
      await service.restoreProduct(product.id);
      expect(productRepo.findInactiveProduct).toHaveBeenCalledWith(product.id);
      expect(productRepo.save).toHaveBeenCalledWith(product);
      expect(product.status).toBe(ProductStatusEnum.ACTIVE);
      expect(product.variants[0].status).toBe(VariantStatusEnum.ACTIVE);
    });
    it('should throw product not found', async () => {
      productRepo.findInactiveProduct.mockResolvedValue(null);
      await expect(service.restoreProduct('wrong-product')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeSoftDeletedProducts', () => {
    it('should remove soft deleted products successfully', async () => {
      const products = [
        {
          id: 'product-1',
        },
      ];
      productRepo.removeSoftDeletedProducts.mockResolvedValue(undefined);
      await service.removeSoftDeletedProducts();
      expect(productRepo.removeSoftDeletedProducts).toHaveBeenCalled();
    });
  });
});
