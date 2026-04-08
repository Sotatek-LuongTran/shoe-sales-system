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
import { BrandStatusEnum } from 'src/shared/enums/brand.enum';
import { AdminProductResponseDto } from './dto/admin-product-response.dto';

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
        name: 'Nike shoe',
        description: 'A great shoe',
        brandId: 'brand-1',
        categoryId: 'category-1',
        gender: GenderEnum.UNISEX,
        productType: ProductTypeEnum.SHOE,
      };

      const brand = {
        id: 'brand-1',
        name: 'Nike',
        description: 'Sports brand',
        status: BrandStatusEnum.ACTIVE,
        logoKey: 'logos/nike.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const category = {
        id: 'category-1',
        name: 'Running',
        description: 'Running shoes category',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const product = {
        id: 'product-1',
        name: dto.name,
        description: dto.description,
        productType: dto.productType,
        gender: dto.gender,
        brand: brand,
        category: category,
        status: ProductStatusEnum.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        variants: [],
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
          description: dto.description,
          gender: dto.gender,
          productType: dto.productType,
          brand,
          category,
          status: ProductStatusEnum.ACTIVE,
        }),
      );
      expect(productRepo.save).toHaveBeenCalledWith(product);
      expect(result).toBeDefined();
      expect(result.name).toBe(dto.name);
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
        id: 'product-1',
        name: 'Nike 2',
        description: 'Updated description',
        brandId: 'brand-2',
        categoryId: 'category-2',
      };

      const brand = {
        id: 'brand-2',
        name: 'Adidas',
        description: 'Sportswear brand',
        status: BrandStatusEnum.ACTIVE,
        logoKey: 'logos/adidas.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const category = {
        id: 'category-2',
        name: 'Sneakers',
        description: 'Sneakers category',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const product = {
        id: 'product-1',
        name: 'Nike 1',
        description: 'Old description',
        productType: ProductTypeEnum.SHOE,
        gender: GenderEnum.UNISEX,
        status: ProductStatusEnum.ACTIVE,
        brand: { id: 'brand-1', name: 'Nike' },
        category: { id: 'category-1', name: 'Running' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        variants: [],
      };

      brandRepo.findById.mockResolvedValue(brand);
      categoryRepo.findById.mockResolvedValue(category);
      productRepo.findById.mockResolvedValue(product);
      productRepo.save.mockResolvedValue(undefined);

      await service.updateProduct(dto as any);

      expect(productRepo.findById).toHaveBeenCalledWith(dto.id);
      expect(brandRepo.findById).toHaveBeenCalledWith(dto.brandId);
      expect(categoryRepo.findById).toHaveBeenCalledWith(dto.categoryId);
      expect(productRepo.save).toHaveBeenCalledWith(product);
      expect(product.name).toBe(dto.name);
      expect(product.description).toBe(dto.description);
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
      const brand = {
        id: 'brand-1',
        name: 'Nike',
        description: 'Sports brand',
        status: BrandStatusEnum.ACTIVE,
        logoKey: 'logos/nike.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const category = {
        id: 'category-1',
        name: 'Running',
        description: 'Running shoes category',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const products = {
        items: [
          {
            id: 'product-1',
            name: 'Nike Air Max',
            description: 'Comfortable running shoes',
            productType: ProductTypeEnum.SHOE,
            gender: GenderEnum.UNISEX,
            status: ProductStatusEnum.ACTIVE,
            brand: brand,
            category: category,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            variants: [
              {
                id: 'variant-1',
                variantValue: 'EU 40',
                price: 100,
                stock: 50,
                reservedStock: 5,
                status: VariantStatusEnum.ACTIVE,
                productId: 'product-1',
                product: { id: 'product-1' },
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                images: [
                  {
                    id: 'img-1',
                    imageKey: 'avatars/product1/variant1/1',
                    variantId: 'variant-1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                  },
                ],
              },
            ],
          },
          {
            id: 'product-2',
            name: 'Nike Zoom Fly',
            description: 'Lightweight running shoes',
            productType: ProductTypeEnum.SHOE,
            gender: GenderEnum.UNISEX,
            status: ProductStatusEnum.ACTIVE,
            brand: brand,
            category: category,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            variants: [
              {
                id: 'variant-2',
                variantValue: 'EU 42',
                price: 120,
                stock: 30,
                reservedStock: 2,
                status: VariantStatusEnum.ACTIVE,
                productId: 'product-2',
                product: { id: 'product-2' },
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                images: [
                  {
                    id: 'img-2',
                    imageKey: 'avatars/product2/variant2/1',
                    variantId: 'variant-2',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
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
      expect(result.data[0]).toBeInstanceOf(AdminProductResponseDto);
    });
  });

  describe('getProduct', () => {
    it('should get product successfully', async () => {
      const brand = {
        id: 'brand-1',
        name: 'Nike',
        description: 'Sports brand',
        status: BrandStatusEnum.ACTIVE,
        logoKey: 'logos/nike.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const category = {
        id: 'category-1',
        name: 'Running',
        description: 'Running shoes category',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const product = {
        id: 'product-1',
        name: 'Nike Air Max',
        description: 'Comfortable running shoes',
        productType: ProductTypeEnum.SHOE,
        gender: GenderEnum.UNISEX,
        status: ProductStatusEnum.ACTIVE,
        brand: brand,
        category: category,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        variants: [
          {
            id: 'variant-1',
            variantValue: 'EU 40',
            price: 100,
            stock: 50,
            reservedStock: 5,
            status: VariantStatusEnum.ACTIVE,
            productId: 'product-1',
            product: { id: 'product-1' },
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            images: [
              {
                id: 'img-1',
                imageKey: 'avatars/product1/variant1/1',
                variantId: 'variant-1',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
              },
            ],
          },
          {
            id: 'variant-2',
            variantValue: 'EU 42',
            price: 120,
            stock: 30,
            reservedStock: 2,
            status: VariantStatusEnum.ACTIVE,
            productId: 'product-1',
            product: { id: 'product-1' },
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
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
      expect(result.name).toBe(product.name);
      expect(result.productVariants).toHaveLength(2);
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
      const brand = {
        id: 'brand-1',
        name: 'Nike',
        description: 'Sports brand',
        status: BrandStatusEnum.ACTIVE,
        logoKey: 'logos/nike.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const category = {
        id: 'category-1',
        name: 'Running',
        description: 'Running shoes category',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const product = {
        id: 'product-1',
        name: 'Nike Air Max',
        description: 'Comfortable running shoes',
        productType: ProductTypeEnum.SHOE,
        gender: GenderEnum.UNISEX,
        status: ProductStatusEnum.ACTIVE,
        brand: brand,
        category: category,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        variants: [],
      };

      productRepo.findById.mockResolvedValue(product);
      productRepo.save.mockResolvedValue(undefined);

      await service.deleteProduct(product.id);

      expect(productRepo.findById).toHaveBeenCalledWith(product.id);
      expect(product.deletedAt).toBeInstanceOf(Date);
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
      const brand = {
        id: 'brand-1',
        name: 'Nike',
        description: 'Sports brand',
        status: BrandStatusEnum.ACTIVE,
        logoKey: 'logos/nike.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const category = {
        id: 'category-1',
        name: 'Running',
        description: 'Running shoes category',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const product = {
        id: 'product-1',
        name: 'Nike Air Max',
        description: 'Comfortable running shoes',
        productType: ProductTypeEnum.SHOE,
        gender: GenderEnum.UNISEX,
        status: ProductStatusEnum.ACTIVE,
        brand: brand,
        category: category,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        variants: [
          {
            id: 'variant-1',
            variantValue: 'EU 40',
            price: 100,
            stock: 50,
            reservedStock: 5,
            status: VariantStatusEnum.ACTIVE,
            productId: 'product-1',
            product: { id: 'product-1' },
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            images: [],
          },
          {
            id: 'variant-2',
            variantValue: 'EU 42',
            price: 120,
            stock: 30,
            reservedStock: 2,
            status: VariantStatusEnum.INACTIVE,
            productId: 'product-1',
            product: { id: 'product-1' },
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            images: [],
          },
        ],
      };

      productRepo.findById.mockResolvedValue(product);
      productRepo.save.mockResolvedValue(undefined);

      await service.deactivateProduct(product.id);

      expect(productRepo.findById).toHaveBeenCalledWith(product.id);
      expect(product.status).toBe(ProductStatusEnum.INACTIVE);
      expect(product.variants[0].status).toBe(VariantStatusEnum.INACTIVE);
      expect(product.variants[1].status).toBe(VariantStatusEnum.INACTIVE);
      expect(productRepo.save).toHaveBeenCalledWith(product);
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
      const brand = {
        id: 'brand-1',
        name: 'Nike',
        description: 'Sports brand',
        status: BrandStatusEnum.ACTIVE,
        logoKey: 'logos/nike.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const category = {
        id: 'category-1',
        name: 'Running',
        description: 'Running shoes category',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const product = {
        id: 'product-1',
        name: 'Nike Air Max',
        description: 'Comfortable running shoes',
        productType: ProductTypeEnum.SHOE,
        gender: GenderEnum.UNISEX,
        status: ProductStatusEnum.INACTIVE,
        brand: brand,
        category: category,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        variants: [
          {
            id: 'variant-1',
            variantValue: 'EU 40',
            price: 100,
            stock: 50,
            reservedStock: 5,
            status: VariantStatusEnum.INACTIVE,
            productId: 'product-1',
            product: { id: 'product-1' },
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            images: [],
          },
          {
            id: 'variant-2',
            variantValue: 'EU 42',
            price: 120,
            stock: 30,
            reservedStock: 2,
            status: VariantStatusEnum.ACTIVE,
            productId: 'product-1',
            product: { id: 'product-1' },
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            images: [],
          },
        ],
      };

      productRepo.findInactiveProduct.mockResolvedValue(product);
      productRepo.save.mockResolvedValue(undefined);

      await service.restoreProduct(product.id);
      expect(productRepo.findInactiveProduct).toHaveBeenCalledWith(product.id);
      expect(product.status).toBe(ProductStatusEnum.ACTIVE);
      expect(product.variants[0].status).toBe(VariantStatusEnum.ACTIVE);
      expect(product.variants[1].status).toBe(VariantStatusEnum.ACTIVE);
      expect(productRepo.save).toHaveBeenCalledWith(product);
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
