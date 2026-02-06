import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRole } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { ProductVariantService } from './product-variant.service';
import { CreateVariantDto } from 'src/shared/dto/product-variant/create-variant.dto';
import { UpdateVariantDto } from 'src/shared/dto/product-variant/update-vatiant.dto';

@ApiTags('Product variants')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('products')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  // =============================
  // CREATE PRODUCT VARIANT
  // =============================
  @Post(':productId/variants')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new productVariant' })
  @ApiResponse({
    status: 201,
    description: 'productVariant created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreateVariantDto) {
    return this.productVariantService.createProductVariant(dto);
  }

  // =============================
  // UPDATE PRODUCT VARIANT
  // =============================
  @Patch(':productId/variants/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a product variant' })
  @ApiResponse({
    status: 201,
    description: 'Product updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(@Body() dto: UpdateVariantDto) {
    return this.productVariantService.updateProductVariant(dto);
  }

  // =============================
  // GET ALL PRODUCT VARIANTS OF A PRODUCT
  // =============================
  @Get(':productId/variants')
  @ApiOperation({
    summary: 'Get variants of a product with pagination',
  })
  @ApiParam({ name: 'productId', description: 'Product ID', type: String, })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'red', })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt', })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], example: 'DESC', })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of product variants',
  })
  @ApiResponse({ status: 404, description: 'Product not found', })
  async getVariantsByProduct(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.productVariantService.getVariantsByProduct(productId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      sortBy,
      sortOrder,
    });
  }

  // =============================
  // GET A PRODUCT VARIANT
  // =============================
  @Get(':productId/variants/:id')
  @ApiOperation({ summary: 'Get product variant detail' })
  @ApiResponse({
    status: 201,
    description: 'ProductVariant get successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getOne(@Param('id') id: string) {
    return this.productVariantService.getProductVariant(id);
  }

  // =============================
  // DELETE PRODUCT VARIANT
  // =============================
  @Delete(':productId/variants/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Soft delete a product variant' })
  @ApiResponse({
    status: 201,
    description: 'ProductVariant deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id') id: string) {
    return this.productVariantService.deleteProductVariant(id);
  }

  // =============================
  // RESTORE DELETED PRODUCT VARIANT
  // =============================
  @Patch(':productId/variants/:id/restore')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Restore a soft-deleted a product variant' })
  @ApiResponse({
    status: 201,
    description: 'Product variant deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  restoreProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productVariantService.restoreProductVariant(id);
  }
}
