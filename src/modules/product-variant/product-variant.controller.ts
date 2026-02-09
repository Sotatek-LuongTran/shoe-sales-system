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
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { ProductVariantService } from './product-variant.service';
import { CreateVariantDto } from 'src/modules/product-variant/dto/create-variant.dto';
import { UpdateVariantDto } from 'src/modules/product-variant/dto/update-vatiant.dto';
import { PaginateVariantsDto } from './dto/paginate-variants.dto';

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
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new productVariant' })
  @ApiResponse({
    status: 201,
    description: 'productVariant created successfully',
  })
  create(@Body() dto: CreateVariantDto) {
    return this.productVariantService.createProductVariant(dto);
  }

  // =============================
  // UPDATE PRODUCT VARIANT
  // =============================
  @Patch(':productId/variants/:id')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a product variant' })
  @ApiResponse({
    status: 201,
    description: 'Product updated successfully',
  })
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
  @ApiParam({ name: 'productId', description: 'Product ID', type: String })
  @ApiQuery({ name: 'dto', required: true, type: PaginateVariantsDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of product variants',
  })
  async getVariantsByProduct(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Query() dto: PaginateVariantsDto,
  ) {
    return this.productVariantService.getVariantsByProductPagination(productId, dto);
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
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getOne(@Param('id') id: string) {
    return this.productVariantService.getProductVariant(id);
  }

  // =============================
  // DELETE PRODUCT VARIANT
  // =============================
  @Delete(':productId/variants/:id')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Soft delete a product variant' })
  @ApiResponse({
    status: 201,
    description: 'ProductVariant deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productVariantService.deleteProductVariant(id);
  }

  // =============================
  // RESTORE DELETED PRODUCT VARIANT
  // =============================
  @Patch(':productId/variants/:id/restore')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Restore a soft-deleted a product variant' })
  @ApiResponse({
    status: 201,
    description: 'Product variant deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  restoreProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productVariantService.restoreProductVariant(id);
  }

  // =======================================
  // Permanently delete soft-deleted ones
  // =======================================
  @Delete('variants/deleted')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Permanently delete soft-deleted variant',
    description: 'Hard delete all variants that are currently soft deleted',
  })
  @ApiResponse({
    status: 204,
    description: 'Soft-deleted variants permanently removed',
  })
  async hardDeleteSoftDeletedProducts() {
    await this.productVariantService.removeSoftDeletedVariants();
  }
}
