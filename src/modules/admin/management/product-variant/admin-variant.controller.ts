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
import { AdminProductVariantService } from './admin-variant.service';
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateVariantDto } from 'src/modules/admin/management/product-variant/dto/create-variant.dto';
import { UpdateVariantDto } from 'src/modules/admin/management/product-variant/dto/update-vatiant.dto';
import { AdminVariantResponseDto } from './dto/admin-variant-response.dto';
import { AdminPaginationVariantResponseDto } from './dto/admin-pag-variant-response.dto';
import { PaginateVariantsDto } from 'src/shared/dto/product-variant/paginate-variants.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';

@Controller('admin/products')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@ApiTags('Admin')
export class AdminProductVariantController {
  constructor(
    private readonly adminProductVariantService: AdminProductVariantService,
  ) {}

  // =============================
  // CREATE PRODUCT VARIANT
  // =============================
  @Post(':productId/variants')
  @ApiOperation({ summary: 'Create a new productVariant' })
  @ApiResponse({
    status: 201,
    description: 'productVariant created successfully',
    type: AdminVariantResponseDto,
  })
  create(@Body() dto: CreateVariantDto) {
    return this.adminProductVariantService.createProductVariant(dto);
  }

  // =============================
  // UPDATE PRODUCT VARIANT
  // =============================
  @Patch(':productId/variants/:id')
  @ApiOperation({ summary: 'Update a product variant' })
  @ApiResponse({
    status: 201,
    description: 'Product updated successfully',
    type: AdminVariantResponseDto,
  })
  update(@Body() dto: UpdateVariantDto) {
    return this.adminProductVariantService.updateProductVariant(dto);
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
    type: AdminPaginationVariantResponseDto,
  })
  async getVariantsByProduct(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Query() dto: PaginateVariantsDto,
  ) {
    return this.adminProductVariantService.getVariantsByProductPagination(
      productId,
      dto,
    );
  }

  // =============================
  // DELETE PRODUCT VARIANT
  // =============================
  @Delete(':productId/variants/:id')
  @ApiOperation({ summary: 'Soft delete a product variant' })
  @ApiResponse({
    status: 201,
    description: 'ProductVariant deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminProductVariantService.deleteProductVariant(id);
  }

  // =============================
  // RESTORE DELETED PRODUCT VARIANT
  // =============================
  @Patch(':productId/variants/:id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted a product variant' })
  @ApiResponse({
    status: 201,
    description: 'Product variant restored successfully',
    type: AdminVariantResponseDto,
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  restoreProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminProductVariantService.restoreProductVariant(id);
  }

  // =======================================
  // Permanently delete soft-deleted ones
  // =======================================
  @Delete('variants/deleted')
  @ApiOperation({
    summary: 'Permanently delete soft-deleted variant',
    description: 'Hard delete all variants that are currently soft deleted',
  })
  @ApiResponse({
    status: 204,
    description: 'Soft-deleted variants permanently removed',
  })
  async hardDeleteSoftDeletedProducts() {
    await this.adminProductVariantService.removeSoftDeletedVariants();
  }
}
