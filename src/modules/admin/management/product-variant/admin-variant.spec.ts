import { Test } from '@nestjs/testing';
import { AdminProductVariantService } from './admin-variant.service';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { VariantImageRepository } from 'src/shared/modules/common-product-variant/variant-image.repository';
import { NotFoundException } from '@nestjs/common';
import {
  VariantStatusEnum,
} from 'src/shared/enums/product-variant.enum';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { AdminVariantResponseDto } from './dto/admin-variant-response.dto';
import { ImageKeysDto } from './dto/image-keys.dto';

describe('AdminProductVariantService', () => {
  let service: AdminProductVariantService;
  let variantRepo: any;
  let productRepo: any;
  let variantImageRepo: any;

  beforeEach(async () => {
    variantRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findVariantsPaginationAdmin: jest.fn(),
      findInactiveVariant: jest.fn(),
      removeSoftDeletedVariants: jest.fn(),
    };

    productRepo = {
      findById: jest.fn(),
      findOneWithBrandAndCategory: jest.fn(),
    };

    variantImageRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AdminProductVariantService,
        { provide: ProductVariantRepository, useValue: variantRepo },
        { provide: ProductRepository, useValue: productRepo },
        { provide: VariantImageRepository, useValue: variantImageRepo },
      ],
    }).compile();

    service = module.get<AdminProductVariantService>(AdminProductVariantService);
  });

  describe('createProductVariant', () => {
    it('should create product variant successfully', async () => {
      const productId = 'product-1';
      const createDto = {
        variantValue: 'EU 40',
        price: 100,
        stock: 50,
        productId: productId,
        keysDto: { keys: ['key1', 'key2'] } as ImageKeysDto,
      };

      const product = {
        id: productId,
        name: 'Nike Air Max',
      };

      const variantEntity = {
        id: 'variant-1',
        variantValue: createDto.variantValue,
        price: createDto.price,
        stock: createDto.stock,
        product: product,
        status: VariantStatusEnum.ACTIVE,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const savedVariant = {
        ...variantEntity,
        images: [
          {
            id: 'img-1',
            imageKey: 'key1',
            variantId: 'variant-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
          {
            id: 'img-2',
            imageKey: 'key2',
            variantId: 'variant-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ],
      };

      productRepo.findById.mockResolvedValue(product);
      variantRepo.create.mockReturnValue(variantEntity);
      variantRepo.save.mockResolvedValue(savedVariant);
      variantImageRepo.create.mockReturnValue({
        imageKey: '',
        variantId: 'variant-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      variantImageRepo.save.mockResolvedValue([]);

      const result = await service.createProductVariant(createDto);

      expect(productRepo.findById).toHaveBeenCalledWith(productId);
      expect(variantRepo.create).toHaveBeenCalledWith({
        variantValue: createDto.variantValue,
        price: createDto.price,
        stock: createDto.stock,
        product: product,
        status: VariantStatusEnum.ACTIVE,
      });
      expect(variantRepo.save).toHaveBeenCalledWith(variantEntity);
      expect(variantImageRepo.create).toHaveBeenCalledTimes(2);
      expect(result).toBeInstanceOf(AdminVariantResponseDto);
      expect(result.variantValue).toBe(createDto.variantValue);
      expect(result.price).toBe(createDto.price);
      expect(result.stock).toBe(createDto.stock);
    });

    it('should create product variant without images when keysDto is empty or undefined', async () => {
      const productId = 'product-1';
      const createDto = {
        variantValue: 'EU 42',
        price: 120,
        stock: 30,
        productId: productId,
        keysDto: { keys: [] } as ImageKeysDto,
      };

      const product = {
        id: productId,
        name: 'Nike Zoom Fly',
      };

      const variantEntity = {
        id: 'variant-2',
        variantValue: createDto.variantValue,
        price: createDto.price,
        stock: createDto.stock,
        product: product,
        status: VariantStatusEnum.ACTIVE,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      productRepo.findById.mockResolvedValue(product);
      variantRepo.create.mockReturnValue(variantEntity);
      variantRepo.save.mockResolvedValue(variantEntity);

      const result = await service.createProductVariant(createDto);

      expect(productRepo.findById).toHaveBeenCalledWith(productId);
      expect(variantRepo.save).toHaveBeenCalledWith(variantEntity);
      expect(variantImageRepo.create).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(AdminVariantResponseDto);
    });

    it('should throw NotFoundException when product not found', async () => {
      const createDto = {
        variantValue: 'EU 40',
        price: 100,
        stock: 50,
        productId: 'non-existent-product',
        keysDto: { keys: [] } as ImageKeysDto,
      };

      productRepo.findById.mockResolvedValue(null);

      await expect(service.createProductVariant(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProductVariant', () => {
    it('should update product variant successfully with all fields', async () => {
      const updateDto = {
        id: 'variant-1',
        variantValue: 'EU 41',
        price: 110,
        stock: 60,
        isActive: true,
      };

      const existingVariant = {
        id: 'variant-1',
        variantValue: 'EU 40',
        price: 100,
        stock: 50,
        status: VariantStatusEnum.INACTIVE,
        productId: 'product-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      variantRepo.findById.mockResolvedValue(existingVariant);
      variantRepo.save.mockResolvedValue(undefined);

      await service.updateProductVariant(updateDto);

      expect(variantRepo.findById).toHaveBeenCalledWith(updateDto.id);
      expect(existingVariant.variantValue).toBe(updateDto.variantValue);
      expect(existingVariant.price).toBe(updateDto.price);
      expect(existingVariant.stock).toBe(updateDto.stock);
      expect(existingVariant.status).toBe(VariantStatusEnum.ACTIVE);
      expect(variantRepo.save).toHaveBeenCalledWith(existingVariant);
    });

    it('should update product variant without changing status when isActive is not provided', async () => {
      const updateDto = {
        id: 'variant-1',
        variantValue: 'EU 41',
        price: 110,
        stock: 60,
      };

      const existingVariant = {
        id: 'variant-1',
        variantValue: 'EU 40',
        price: 100,
        stock: 50,
        status: VariantStatusEnum.ACTIVE,
        productId: 'product-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      variantRepo.findById.mockResolvedValue(existingVariant);
      variantRepo.save.mockResolvedValue(undefined);

      await service.updateProductVariant(updateDto);

      expect(variantRepo.findById).toHaveBeenCalledWith(updateDto.id);
      expect(existingVariant.variantValue).toBe(updateDto.variantValue);
      expect(existingVariant.price).toBe(updateDto.price);
      expect(existingVariant.stock).toBe(updateDto.stock);
      expect(existingVariant.status).toBe(VariantStatusEnum.ACTIVE);
      expect(variantRepo.save).toHaveBeenCalledWith(existingVariant);
    });

    it('should deactivate variant when isActive is false', async () => {
      const updateDto = {
        id: 'variant-1',
        isActive: false,
      };

      const existingVariant = {
        id: 'variant-1',
        variantValue: 'EU 40',
        price: 100,
        stock: 50,
        status: VariantStatusEnum.ACTIVE,
        productId: 'product-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      variantRepo.findById.mockResolvedValue(existingVariant);
      variantRepo.save.mockResolvedValue(undefined);

      await service.updateProductVariant(updateDto);

      expect(variantRepo.findById).toHaveBeenCalledWith(updateDto.id);
      expect(existingVariant.status).toBe(VariantStatusEnum.INACTIVE);
      expect(variantRepo.save).toHaveBeenCalledWith(existingVariant);
    });

    it('should throw NotFoundException when variant not found', async () => {
      const updateDto = {
        id: 'non-existent-variant',
        variantValue: 'EU 41',
      };

      variantRepo.findById.mockResolvedValue(null);

      await expect(service.updateProductVariant(updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteProductVariant', () => {
    it('should delete product variant successfully (soft delete)', async () => {
      const variantId = 'variant-1';
      const existingVariant = {
        id: variantId,
        variantValue: 'EU 40',
        price: 100,
        stock: 50,
        status: VariantStatusEnum.ACTIVE,
        productId: 'product-1',
        deletedAt: null,
      };

      variantRepo.findById.mockResolvedValue(existingVariant);
      variantRepo.save.mockResolvedValue(undefined);

      await service.deleteProductVariant(variantId);

      expect(variantRepo.findById).toHaveBeenCalledWith(variantId);
      expect(existingVariant.deletedAt).toBeInstanceOf(Date);
      expect(variantRepo.save).toHaveBeenCalledWith(existingVariant);
    });

    it('should throw NotFoundException when variant not found', async () => {
      const variantId = 'non-existent-variant';
      variantRepo.findById.mockResolvedValue(null);

      await expect(service.deleteProductVariant(variantId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getVariantsByProductPagination', () => {
    it('should get variants by product pagination successfully', async () => {
      const productId = 'product-1';
      const paginateDto = {
        page: 1,
        limit: 10,
        includeDeleted: false,
        status: VariantStatusEnum.ACTIVE,
      };

      const product = {
        id: productId,
        name: 'Nike Air Max',
        brand: { id: 'brand-1' },
        category: { id: 'category-1' },
      };

      const variants = {
        items: [
          {
            id: 'variant-1',
            variantValue: 'EU 40',
            price: 100,
            stock: 50,
            reservedStock: 5,
            status: VariantStatusEnum.ACTIVE,
            productId: productId,
            product: { id: productId },
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
          {
            id: 'variant-2',
            variantValue: 'EU 42',
            price: 120,
            stock: 30,
            reservedStock: 2,
            status: VariantStatusEnum.ACTIVE,
            productId: productId,
            product: { id: productId },
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
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

      productRepo.findOneWithBrandAndCategory.mockResolvedValue(product);
      variantRepo.findVariantsPaginationAdmin.mockResolvedValue(variants);

      const result = await service.getVariantsByProductPagination(productId, paginateDto);

      expect(productRepo.findOneWithBrandAndCategory).toHaveBeenCalledWith(productId);
      expect(variantRepo.findVariantsPaginationAdmin).toHaveBeenCalledWith(productId, paginateDto);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data.length).toBe(2);
      expect(result.data[0]).toBeInstanceOf(AdminVariantResponseDto);
    });

    it('should throw NotFoundException when product not found', async () => {
      const productId = 'non-existent-product';
      const paginateDto = {
        page: 1,
        limit: 10,
      };

      productRepo.findOneWithBrandAndCategory.mockResolvedValue(null);

      await expect(
        service.getVariantsByProductPagination(productId, paginateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when brand not found', async () => {
      const productId = 'product-1';
      const paginateDto = {
        page: 1,
        limit: 10,
      };

      const product = {
        id: productId,
        name: 'Nike Air Max',
        brand: { id: null },
        category: { id: 'category-1' },
      };

      productRepo.findOneWithBrandAndCategory.mockResolvedValue(product);

      await expect(
        service.getVariantsByProductPagination(productId, paginateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when category not found', async () => {
      const productId = 'product-1';
      const paginateDto = {
        page: 1,
        limit: 10,
      };

      const product = {
        id: productId,
        name: 'Nike Air Max',
        brand: { id: 'brand-1' },
        category: { id: null },
      };

      productRepo.findOneWithBrandAndCategory.mockResolvedValue(product);

      await expect(
        service.getVariantsByProductPagination(productId, paginateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProductVariant', () => {
    it('should get product variant successfully', async () => {
      const variantId = 'variant-1';
      const variant = {
        id: variantId,
        variantValue: 'EU 40',
        price: 100,
        stock: 50,
        reservedStock: 5,
        status: VariantStatusEnum.ACTIVE,
        productId: 'product-1',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      variantRepo.findById.mockResolvedValue(variant);

      const result = await service.getProductVariant(variantId);

      expect(variantRepo.findById).toHaveBeenCalledWith(variantId);
      expect(result).toBeInstanceOf(AdminVariantResponseDto);
      expect(result.variantValue).toBe(variant.variantValue);
    });

    it('should throw NotFoundException when variant not found', async () => {
      const variantId = 'non-existent-variant';
      variantRepo.findById.mockResolvedValue(null);

      await expect(service.getProductVariant(variantId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deactivateProductVariant', () => {
    it('should deactivate product variant successfully', async () => {
      const variantId = 'variant-1';
      const variant = {
        id: variantId,
        variantValue: 'EU 40',
        price: 100,
        stock: 50,
        status: VariantStatusEnum.ACTIVE,
        productId: 'product-1',
      };

      variantRepo.findById.mockResolvedValue(variant);
      variantRepo.save.mockResolvedValue(undefined);

      await service.deactivateProductVariant(variantId);

      expect(variantRepo.findById).toHaveBeenCalledWith(variantId);
      expect(variant.status).toBe(VariantStatusEnum.INACTIVE);
      expect(variantRepo.save).toHaveBeenCalledWith(variant);
    });

    it('should throw NotFoundException when variant not found', async () => {
      const variantId = 'non-existent-variant';
      variantRepo.findById.mockResolvedValue(null);

      await expect(service.deactivateProductVariant(variantId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restoreProductVariant', () => {
    it('should restore product variant successfully', async () => {
      const variantId = 'variant-1';
      const variant = {
        id: variantId,
        variantValue: 'EU 40',
        price: 100,
        stock: 50,
        status: VariantStatusEnum.INACTIVE,
        productId: 'product-1',
      };

      variantRepo.findInactiveVariant.mockResolvedValue(variant);
      variantRepo.save.mockResolvedValue(undefined);

      await service.restoreProductVariant(variantId);

      expect(variantRepo.findInactiveVariant).toHaveBeenCalledWith(variantId);
      expect(variant.status).toBe(VariantStatusEnum.ACTIVE);
      expect(variantRepo.save).toHaveBeenCalledWith(variant);
    });

    it('should throw NotFoundException when variant not found', async () => {
      const variantId = 'non-existent-variant';
      variantRepo.findInactiveVariant.mockResolvedValue(null);

      await expect(service.restoreProductVariant(variantId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeSoftDeletedVariants', () => {
    it('should remove soft deleted variants successfully', async () => {
      variantRepo.removeSoftDeletedVariants.mockResolvedValue(undefined);

      await service.removeSoftDeletedVariants();

      expect(variantRepo.removeSoftDeletedVariants).toHaveBeenCalled();
    });
  });

  describe('uploadVariantImages', () => {
    it('should upload variant images successfully', async () => {
      const productId = 'product-1';
      const variantId = 'variant-1';
      const dto = { keys: ['image-key-1', 'image-key-2'] } as ImageKeysDto;

      const product = {
        id: productId,
        name: 'Nike Air Max',
        brand: { id: 'brand-1' },
        category: { id: 'category-1' },
      };

      const variant = {
        id: variantId,
        variantValue: 'EU 40',
        productId: productId,
      };

      productRepo.findOneWithBrandAndCategory.mockResolvedValue(product);
      variantRepo.findById.mockResolvedValue(variant);
      variantImageRepo.create.mockReturnValue({
        imageKey: '',
        variantId: variantId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      variantImageRepo.save.mockResolvedValue([]);

      await service.uploadVariantImages(productId, variantId, dto);

      expect(productRepo.findOneWithBrandAndCategory).toHaveBeenCalledWith(productId);
      expect(variantRepo.findById).toHaveBeenCalledWith(variantId);
      expect(variantImageRepo.create).toHaveBeenCalledTimes(2);
      expect(variantImageRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          imageKey: 'image-key-1',
          variantId: variantId,
        }),
      );
      expect(variantImageRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          imageKey: 'image-key-2',
          variantId: variantId,
        }),
      );
      expect(variantImageRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when product not found', async () => {
      const productId = 'non-existent-product';
      const variantId = 'variant-1';
      const dto = { keys: ['key1'] } as ImageKeysDto;

      productRepo.findOneWithBrandAndCategory.mockResolvedValue(null);

      await expect(
        service.uploadVariantImages(productId, variantId, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when brand not found', async () => {
      const productId = 'product-1';
      const variantId = 'variant-1';
      const dto = { keys: ['key1'] } as ImageKeysDto;

      const product = {
        id: productId,
        name: 'Nike Air Max',
        brand: { id: null },
        category: { id: 'category-1' },
      };

      productRepo.findOneWithBrandAndCategory.mockResolvedValue(product);

      await expect(
        service.uploadVariantImages(productId, variantId, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when category not found', async () => {
      const productId = 'product-1';
      const variantId = 'variant-1';
      const dto = { keys: ['key1'] } as ImageKeysDto;

      const product = {
        id: productId,
        name: 'Nike Air Max',
        brand: { id: 'brand-1' },
        category: { id: null },
      };

      productRepo.findOneWithBrandAndCategory.mockResolvedValue(product);

      await expect(
        service.uploadVariantImages(productId, variantId, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when variant not found', async () => {
      const productId = 'product-1';
      const variantId = 'non-existent-variant';
      const dto = { keys: ['key1'] } as ImageKeysDto;

      const product = {
        id: productId,
        name: 'Nike Air Max',
        brand: { id: 'brand-1' },
        category: { id: 'category-1' },
      };

      productRepo.findOneWithBrandAndCategory.mockResolvedValue(product);
      variantRepo.findById.mockResolvedValue(null);

      await expect(
        service.uploadVariantImages(productId, variantId, dto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
