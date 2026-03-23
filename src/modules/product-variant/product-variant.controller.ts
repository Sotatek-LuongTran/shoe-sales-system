import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { ProductVariantService } from './product-variant.service';
import { PaginateVariantsDto } from '../../shared/dto/product-variant/paginate-variants.dto';
import { ProductVariantResponseDto } from 'src/shared/dto/product-variant/product-variant-response.dto';
import { ApiPaginatedResponse } from 'src/shared/decorators/api-paginated-response.decorator';
import { ApiBaseResponse } from 'src/shared/decorators/api-base-response.decorator';

@ApiTags('Product variants')
// @ApiBearerAuth('access-token')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(UserRoleEnum.USER)
@Controller('products')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  // =============================
  // GET ALL PRODUCT VARIANTS OF A PRODUCT
  // =============================
  @Get(':productId/variants')
  @ApiOperation({
    summary: 'Get variants of a product with pagination',
  })
  @ApiParam({ name: 'productId', description: 'Product ID', type: String })
  @ApiPaginatedResponse(ProductVariantResponseDto)
  @UseInterceptors(ClassSerializerInterceptor)
  async getVariantsByProduct(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Query() dto: PaginateVariantsDto,
  ) {
    return this.productVariantService.getVariantsByProductPagination(
      productId,
      dto,
    );
  }

  // =============================
  // GET A PRODUCT VARIANT
  // =============================
  @Get(':productId/variants/:id')
  @ApiOperation({ summary: 'Get product variant detail' })
  @ApiBaseResponse(ProductVariantResponseDto)
  @ApiParam({ name: 'productId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'variantId', type: 'string', format: 'uuid' })
  @UseInterceptors(ClassSerializerInterceptor)
  getOne(@Param('productId') productId: string, @Param('variantId') variantId: string) {
    return this.productVariantService.getProductVariant(productId, variantId);
  }
}
