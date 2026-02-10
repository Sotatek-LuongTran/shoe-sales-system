import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateVariantDto } from 'src/modules/product-variant/dto/create-variant.dto';
import { UpdateVariantDto } from 'src/modules/product-variant/dto/update-vatiant.dto';

@Controller('admin/product-variants')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@UseGuards(RolesGuard)
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
  })
  update(@Body() dto: UpdateVariantDto) {
    return this.adminProductVariantService.updateProductVariant(dto);
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
    description: 'Product variant deleted successfully',
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
