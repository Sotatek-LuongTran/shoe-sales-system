import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ProductEntity } from 'src/database/entities/product.entity';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { PaginateProductsDto } from '../admin/management/product/dto/paginate-products.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
  ) {}

  async getProductsPagination(dto: PaginateProductsDto): Promise<Pagination<ProductEntity>> {
    return this.productRepository.findProductsPagination(dto);
  }

  async getProduct(id: string) {
    const product = await this.productRepository.findProductWithPriceRange(id);

    if (!product.entities.length) {
      throw new NotFoundException('No product found');
    }

    return {
      ...product.entities[0],
      priceRange: {
        min: Number(product.raw[0].minprice),
        max: Number(product.raw[0].maxprice),
      },
    };
  }
}
