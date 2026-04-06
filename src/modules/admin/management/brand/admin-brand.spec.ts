import { Test } from '@nestjs/testing';
import { AdminBrandService } from './admin-brand.service';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BrandStatusEnum } from 'src/shared/enums/brand.enum';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { AdminBrandResponseDto } from './dto/admin-brand-response.dto';

describe('AdminBrandService', () => {
  let service: AdminBrandService;
  let brandRepo: any;

  beforeEach(async () => {
    brandRepo = {
      findByName: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findBrandsPaginationAdmin: jest.fn(),
      findById: jest.fn(),
      findInactiveBrand: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AdminBrandService,
        { provide: BrandRepository, useValue: brandRepo },
      ],
    }).compile();

    service = module.get<AdminBrandService>(AdminBrandService);
  });

  describe('getBrandsPagination', () => {
    it('should get brands pagination successfully', async () => {
      const dto = {
        page: 1,
        limit: 10,
      };

      const brands = {
        items: [
          {
            id: 'brand-1',
            name: 'Nike',
            description: 'Sports brand',
            status: BrandStatusEnum.ACTIVE,
            logoKey: 'logos/nike.png',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
          {
            id: 'brand-2',
            name: 'Adidas',
            description: 'Sportswear',
            status: BrandStatusEnum.ACTIVE,
            logoKey: 'logos/adidas.png',
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

      brandRepo.findBrandsPaginationAdmin.mockResolvedValue(brands);

      const result = await service.getBrandsPagination(dto);

      expect(result).toBeDefined();
      expect(result.meta).toEqual(brands.meta);
      expect(result.data.length).toBe(2);
      expect(result.data[0]).toBeInstanceOf(AdminBrandResponseDto);
    });
  });

  describe('createBrand', () => {
    it('should create brand successfully', async () => {
      const createDto = {
        name: 'New Brand',
        description: 'A new brand',
        logoKey: 'logos/new-brand.png',
      };

      const brand = {
        id: 'brand-1',
        ...createDto,
        status: BrandStatusEnum.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      brandRepo.findByName.mockResolvedValue(null);
      brandRepo.create.mockReturnValue(brand);
      brandRepo.save.mockResolvedValue(brand);

      const result = await service.createBrand(createDto as any);

      expect(brandRepo.findByName).toHaveBeenCalledWith(createDto.name);
      expect(brandRepo.create).toHaveBeenCalledWith(createDto);
      expect(brandRepo.save).toHaveBeenCalledWith(brand);
      expect(result).toBeInstanceOf(AdminBrandResponseDto);
      expect(result.name).toBe(createDto.name);
    });

    it('should throw BadRequestException when brand already exists', async () => {
      const createDto = {
        name: 'Existing Brand',
        description: 'Description',
        logoKey: 'logos/existing.png',
      };

      brandRepo.findByName.mockResolvedValue({ id: 'brand-1', name: createDto.name });

      await expect(service.createBrand(createDto as any)).rejects.toThrow(
        BadRequestException,
      );

      const error = await service.createBrand(createDto as any).catch((e) => e);
      expect(error.response.errorCode).toBe(ErrorCodeEnum.BRAND_ALREADY_EXIST);
      expect(error.response.statusCode).toBe(400);
      expect(error.response.message).toBe('Brand has already existed');
    });
  });

  describe('updateBrand', () => {
    it('should update brand successfully', async () => {
      const updateDto = {
        id: 'brand-1',
        name: 'Updated Brand Name',
        description: 'Updated description',
        logoKey: 'logos/updated.png',
      };

      const brand = {
        id: 'brand-1',
        name: 'Old Name',
        description: 'Old description',
        logoKey: 'logos/old.png',
        status: BrandStatusEnum.ACTIVE,
      };

      brandRepo.findById.mockResolvedValue(brand);
      brandRepo.save.mockResolvedValue(undefined);

      await service.updateBrand(updateDto as any);

      expect(brandRepo.findById).toHaveBeenCalledWith(updateDto.id);
      expect(brandRepo.save).toHaveBeenCalledWith(brand);
      expect(brand.name).toBe(updateDto.name);
      expect(brand.description).toBe(updateDto.description);
      expect(brand.logoKey).toBe(updateDto.logoKey);
    });

    it('should throw NotFoundException when brand not found', async () => {
      const updateDto = {
        id: 'non-existent',
        name: 'New Name',
        description: 'Desc',
        logoKey: 'logos/test.png',
      };

      brandRepo.findById.mockResolvedValue(null);

      await expect(service.updateBrand(updateDto as any)).rejects.toThrow(
        NotFoundException,
      );

      const error = await service.updateBrand(updateDto as any).catch((e) => e);
      expect(error.response.errorCode).toBe(ErrorCodeEnum.BRAND_NOT_FOUND);
      expect(error.response.statusCode).toBe(404);
      expect(error.response.message).toBe('Brand not found');
    });
  });

  describe('deactivateBrand', () => {
    it('should deactivate brand successfully', async () => {
      const brandId = 'brand-1';
      const brand = {
        id: brandId,
        name: 'Nike',
        status: BrandStatusEnum.ACTIVE,
      };

      brandRepo.findById.mockResolvedValue(brand);
      brandRepo.save.mockResolvedValue(undefined);

      await service.deactivateBrand(brandId);

      expect(brandRepo.findById).toHaveBeenCalledWith(brandId);
      expect(brand.status).toBe(BrandStatusEnum.INACTIVE);
      expect(brandRepo.save).toHaveBeenCalledWith(brand);
    });

    it('should throw NotFoundException when brand not found', async () => {
      const brandId = 'non-existent';
      brandRepo.findById.mockResolvedValue(null);

      await expect(service.deactivateBrand(brandId)).rejects.toThrow(
        NotFoundException,
      );

      const error = await service.deactivateBrand(brandId).catch((e) => e);
      expect(error.response.errorCode).toBe(ErrorCodeEnum.BRAND_NOT_FOUND);
      expect(error.response.statusCode).toBe(404);
      expect(error.response.message).toBe('Brand not found');
    });
  });

  describe('deleteBrand', () => {
    it('should soft delete brand successfully', async () => {
      const brandId = 'brand-1';
      const brand = {
        id: brandId,
        name: 'Nike',
        deletedAt: null,
      };

      brandRepo.findById.mockResolvedValue(brand);
      brandRepo.save.mockResolvedValue(undefined);

      await service.deleteBrand(brandId);

      expect(brandRepo.findById).toHaveBeenCalledWith(brandId);
      expect(brand.deletedAt).toBeInstanceOf(Date);
      expect(brandRepo.save).toHaveBeenCalledWith(brand);
    });

    it('should throw NotFoundException when brand not found', async () => {
      const brandId = 'non-existent';
      brandRepo.findById.mockResolvedValue(null);

      await expect(service.deleteBrand(brandId)).rejects.toThrow(
        NotFoundException,
      );

      const error = await service.deleteBrand(brandId).catch((e) => e);
      expect(error.response.errorCode).toBe(ErrorCodeEnum.BRAND_NOT_FOUND);
      expect(error.response.statusCode).toBe(404);
      expect(error.response.message).toBe('Brand not found');
    });
  });

  describe('restoreBrand', () => {
    it('should restore brand successfully', async () => {
      const brandId = 'brand-1';
      const brand = {
        id: brandId,
        name: 'Nike',
        status: BrandStatusEnum.INACTIVE,
      };

      brandRepo.findInactiveBrand.mockResolvedValue(brand);
      brandRepo.save.mockResolvedValue(undefined);

      await service.restoreBrand(brandId);

      expect(brandRepo.findInactiveBrand).toHaveBeenCalledWith(brandId);
      expect(brand.status).toBe(BrandStatusEnum.ACTIVE);
      expect(brandRepo.save).toHaveBeenCalledWith(brand);
    });

    it('should throw NotFoundException when inactive brand not found', async () => {
      const brandId = 'non-existent';
      brandRepo.findInactiveBrand.mockResolvedValue(null);

      await expect(service.restoreBrand(brandId)).rejects.toThrow(
        NotFoundException,
      );

      const error = await service.restoreBrand(brandId).catch((e) => e);
      expect(error.response.errorCode).toBe(ErrorCodeEnum.BRAND_NOT_FOUND);
      expect(error.response.statusCode).toBe(404);
      expect(error.response.message).toBe('Brand not found');
    });
  });

  describe('uploadBrandLogo', () => {
    it('should upload brand logo successfully', async () => {
      const brandId = 'brand-1';
      const key = 'logos/new-logo.png';
      const brand = {
        id: brandId,
        name: 'Nike',
        logoKey: 'logos/old.png',
      };

      brandRepo.findById.mockResolvedValue(brand);
      brandRepo.save.mockResolvedValue(undefined);

      await service.uploadBrandLogo(brandId, key);

      expect(brandRepo.findById).toHaveBeenCalledWith(brandId);
      expect(brand.logoKey).toBe(key);
      expect(brandRepo.save).toHaveBeenCalledWith(brand);
    });

    it('should throw NotFoundException when brand not found', async () => {
      const brandId = 'non-existent';
      const key = 'logos/test.png';
      brandRepo.findById.mockResolvedValue(null);

      await expect(service.uploadBrandLogo(brandId, key)).rejects.toThrow(
        NotFoundException,
      );

      const error = await service.uploadBrandLogo(brandId, key).catch((e) => e);
      expect(error.response.errorCode).toBe(ErrorCodeEnum.BRAND_NOT_FOUND);
      expect(error.response.statusCode).toBe(404);
      expect(error.response.message).toBe('Brand not found');
    });
  });
});
