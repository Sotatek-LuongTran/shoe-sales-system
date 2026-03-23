import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { PaginateProductsDto } from '../../shared/dto/product/paginate-products.dto';
import { ProductResponseDto } from 'src/shared/dto/product/product-respose.dto';
import { ApiPaginatedResponse } from 'src/shared/decorators/api-paginated-response.decorator';
import { ResponseInterceptor } from 'src/shared/interceptors/response.interceptor';
import { ImageKeyInterceptor } from 'src/shared/interceptors/image-key.interceptor';
import { ApiBaseResponse } from 'src/shared/decorators/api-base-response.decorator';

@ApiTags('Products')
// @ApiBearerAuth('access-token')
@Controller('products')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(UserRoleEnum.USER)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // =============================
  // GET ALL PRODUCTS
  // =============================
  @Get()
  @ApiOperation({ summary: 'Get products with pagination & filters' })
  @ApiPaginatedResponse(ProductResponseDto)
  @UseInterceptors(ClassSerializerInterceptor, ResponseInterceptor)
  getList(@Query() dto: PaginateProductsDto) {
    return this.productService.getProductsPagination(dto);
  }

  // =============================
  // GET PRODUCT
  // =============================
  @Get(':id')
  @ApiOperation({ summary: 'Get product detail' })
  @ApiBaseResponse(ProductResponseDto)
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @UseInterceptors(ClassSerializerInterceptor)
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.getProduct(id);
  }
}
