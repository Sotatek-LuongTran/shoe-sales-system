import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ProductEntity } from 'src/database/entities/product.entity';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { PaginateProductsDto } from '../../shared/dto/product/paginate-products.dto';
import { ProductResponseDto } from 'src/shared/dto/product/product-respose.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
  ) {}

  async getProductsPagination(dto: PaginateProductsDto): Promise<Pagination<ProductResponseDto>> {
    const products = await this.productRepository.findProductsPagination(dto);

    return {
      ...products,
      items: products.items.map(
        item => new ProductResponseDto(item)
      )
    }
  }

  async getProduct(id: string) {
    const product = await this.productRepository.findProductWithVariants(id);

    if (!product) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PRODUCT_NOT_FOUND,
        statusCode: 404,
      });
    }

    return new ProductResponseDto(product)
  }
}
