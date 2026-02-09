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
import { ProductService } from './product.service';
import { CreateProductDto } from 'src/modules/product/dto/create-product.dto';
import { UpdateProductDto } from 'src/modules/product/dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { Roles } from 'src/shared/decorators/role.decorator';
import { PaginateProductsDto } from './dto/paginate-products.dto';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // =============================
  // CREATE PRODUCT
  // =============================
  @Post()
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  // =============================
  // GET ALL PRODUCTS
  // =============================
  @Get()
  @ApiOperation({ summary: 'Get products with pagination & filters' })
  @ApiResponse({
    status: 201,
    description: 'Products get successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'dto', required: true, type: PaginateProductsDto })
  getList(@Query() dto: PaginateProductsDto) {
    return this.productService.getProductsPagination(dto);
  }

  // =======================================
  // Permanently delete soft-deleted ones
  // =======================================
  @Delete('deleted')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Permanently delete soft-deleted products',
    description: 'Hard delete all products that are currently soft deleted',
  })
  @ApiResponse({
    status: 204,
    description: 'Soft-deleted products permanently removed',
  })
  async hardDeleteSoftDeletedProducts() {
    return await this.productService.removeSoftDeletedProducts();
  }

  // =============================
  // UPDATE PRODUCT
  // =============================
  @Patch(':id')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 201,
    description: 'Product updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(@Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(dto);
  }

  // =============================
  // GET PRODUCT
  // =============================
  @Get(':id')
  @ApiOperation({ summary: 'Get product detail' })
  @ApiResponse({
    status: 201,
    description: 'Product get successfully',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.getProduct(id);
  }

  // =============================
  // DELETE PRODUCT
  // =============================
  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Soft delete a product' })
  @ApiResponse({
    status: 201,
    description: 'Product deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.deleteProduct(id);
  }

  // =============================
  // RESTORE DELETED PRODUCT
  // =============================
  @Patch(':id/restore')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Restore a soft-deleted a product' })
  @ApiResponse({
    status: 201,
    description: 'Product deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  restoreProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.restoreProduct(id);
  }
}
