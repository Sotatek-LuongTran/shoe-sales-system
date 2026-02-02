import { Test, TestingModule } from '@nestjs/testing';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BrandService } from 'src/modules/brand/brand.service';

describe('BrandService', () => {
  let service: BrandService;
  let brandRepository: jest.Mocked<BrandRepository>;
  let productRepository: jest.Mocked<ProductRepository>;

  const mockBrandRepository = {
    findByName: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    getListPagination: jest.fn(),
  };

  const mockProductRepository = {
    findAllByBrand: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandService,
        {
          provide: BrandRepository,
          useValue: mockBrandRepository,
        },
        {
          provide: ProductRepository,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<BrandService>(BrandService);
    brandRepository = module.get(BrandRepository);
    productRepository = module.get(ProductRepository);

    jest.clearAllMocks();
  });

  // =========================
  // createBrand
  // =========================
  describe('createBrand', () => {
    it('should create and save a brand', async () => {
      const dto = { name: 'Nike' };

      brandRepository.findByName.mockResolvedValue(null);
      brandRepository.create.mockReturnValue(dto as any);
      brandRepository.save.mockResolvedValue({ id: '1', ...dto } as any);

      const result = await service.createBrand(dto as any);

      expect(brandRepository.findByName).toHaveBeenCalledWith('Nike');
      expect(brandRepository.create).toHaveBeenCalledWith(dto);
      expect(brandRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Nike');
    });

    it('should throw if brand already exists', async () => {
      brandRepository.findByName.mockResolvedValue({ id: '1' } as any);

      await expect(
        service.createBrand({ name: 'Nike' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // =========================
  // updateBrand
  // =========================
  describe('updateBrand', () => {
    it('should update and save brand', async () => {
      const brand = { id: '1', name: 'Old' };

      brandRepository.findById.mockResolvedValue(brand as any);
      brandRepository.save.mockResolvedValue({ ...brand, name: 'New' } as any);

      const result = await service.updateBrand({
        id: '1',
        name: 'New',
      } as any);

      expect(result.name).toBe('New');
    });

    it('should throw if brand not found', async () => {
      brandRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateBrand({ id: '1' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =========================
  // deleteBrand (soft delete)
  // =========================
  describe('deleteBrand', () => {
    it('should soft delete brand', async () => {
      const brand = { id: '1', deletedAt: null };

      brandRepository.findById.mockResolvedValue(brand as any);
      brandRepository.save.mockResolvedValue({
        ...brand,
        deletedAt: new Date(),
      } as any);

      const result = await service.deleteBrand('1');

      expect(result.deletedAt).toBeInstanceOf(Date);
    });

    it('should throw if brand not found', async () => {
      brandRepository.findById.mockResolvedValue(null);

      await expect(service.deleteBrand('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =========================
  // getBrandsPagination
  // =========================
  describe('getBrandsPagination', () => {
    it('should return paginated brands', async () => {
      const mockResult = {
        data: [],
        total: 0,
      };

      brandRepository.getListPagination.mockResolvedValue(mockResult as any);

      const result = await service.getBrandsPagination({
        page: 1,
        limit: 10,
      });

      expect(brandRepository.getListPagination).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  // =========================
  // getProductsByBrand
  // =========================
  describe('getProductsByBrand', () => {
    it('should return products for brand', async () => {
      brandRepository.findById.mockResolvedValue({ id: '1' } as any);
      productRepository.findAllByBrand.mockResolvedValue([{ id: 'p1' }] as any);

      const result = await service.getProductsByBrand('1');

      expect(result.length).toBe(1);
      expect(productRepository.findAllByBrand).toHaveBeenCalledWith('1');
    });

    it('should throw if brand not found', async () => {
      brandRepository.findById.mockResolvedValue(null);

      await expect(service.getProductsByBrand('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =========================
  // getBrand
  // =========================
  describe('getBrand', () => {
    it('should return brand', async () => {
      brandRepository.findById.mockResolvedValue({ id: '1' } as any);

      const result = await service.getBrand('1');

      expect(result.id).toBe('1');
    });

    it('should throw if brand not found', async () => {
      brandRepository.findById.mockResolvedValue(null);

      await expect(service.getBrand('1')).rejects.toThrow(NotFoundException);
    });
  });
});
