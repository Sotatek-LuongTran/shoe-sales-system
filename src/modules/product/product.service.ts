import { Injectable, NotFoundException } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ProductEntity } from 'src/database/entities/product.entity';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { PaginateProductsDto } from '../../shared/dto/product/paginate-products.dto';
import { ProductResponseDto } from 'src/shared/dto/product/product-respose.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { StorageService } from 'src/shared/modules/storage/storage.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly storageService: StorageService,
  ) {}

  async getProductsPagination(
    dto: PaginateProductsDto,
  ): Promise<Pagination<ProductResponseDto>> {
    const products =
      await this.productRepository.findProductsPaginationUser(dto);

    const items = await Promise.all(
      products.items.map(async (product) => {
        const productDto = new ProductResponseDto(product);
        await Promise.all(
          productDto.productVariants.map(async (variantDto, vIndex) => {
            const variant = product.variants[vIndex];

            await Promise.all(
              variantDto.images.map(async (imageDto, iIndex) => {
                const image = variant.images[iIndex];

                imageDto.imageUrl =
                  await this.storageService.getPresignedSignedUrl(
                    image.imageKey,
                  );
              }),
            );
          }),
        );
        return productDto;
      }),
    );
    return {
      items: items,
      meta: products.meta,
    };
  }

  async getProduct(id: string) {
    const product = await this.productRepository.findProductWithVariants(id);

    if (!product) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_NOT_FOUND,
        statusCode: 404,
        message: 'Product not found',
      });
    }

    const dto = new ProductResponseDto(product);

    await Promise.all(
      dto.productVariants.map(async (variantDto, index) => {
        const variant = product.variants[index];

        await Promise.all(
          variantDto.images.map(async (imageDto, imIndex) => {
            const image = variant.images[imIndex];

            imageDto.imageUrl = await this.storageService.getPresignedSignedUrl(
              image.imageKey,
            );
          }),
        );
      }),
    );

    return dto;
  }
}
