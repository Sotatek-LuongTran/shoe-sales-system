import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductVariantService } from './product-variant.service';
import { PaginateVariantsDto } from '../../shared/dto/product-variant/paginate-variants.dto';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { Roles } from 'src/shared/decorators/role.decorator';
import { ProductVariantResponseDto } from 'src/shared/dto/product-variant/product-variant-response.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ApiPaginatedResponse } from 'src/shared/decorators/api-paginated-response.decorator';

@ApiTags('Product variants')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.USER)
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
  @ApiResponse({
    status: 200,
    description: 'Paginated list of product variants'
  })
  @ApiPaginatedResponse(ProductVariantResponseDto)
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
  @ApiResponse({
    status: 201,
    description: 'ProductVariant get successfully',
    type: ProductVariantResponseDto,
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getOne(@Param('id') id: string) {
    return this.productVariantService.getProductVariant(id);
  }
}
