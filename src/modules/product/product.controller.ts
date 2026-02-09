import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  getList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query() filters?: Record<string, any>,
  ) {
    return this.productService.getActiveProductsPagination({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      filters,
    });
  }

  // =============================
  // GET ALL PRODUCTS FOR ADMIN
  // =============================
  @Get('admin')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get products with pagination & filters' })
  @ApiResponse({
    status: 201,
    description: 'Products get successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  getProducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query() filters?: Record<string, any>,
  ) {
    return this.productService.getProductsPagination({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      filters,
    });
  }

  // ===============================
  // Get soft-deleted products
  // ===============================
  @Get('deleted')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get soft-deleted products',
    description: 'Retrieve products that were soft deleted (recycle bin)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'nike',
    description: 'Search by product name or description',
  })
  @ApiResponse({
    status: 200,
    description: 'List of soft-deleted products',
  })
  async getSoftDeletedProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.productService.getSoftDeletedProductsPagination({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
    });
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
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.deleteProduct(id);
  }

  // =============================
  // GET PRODUCTS BY CATEGORY
  // =============================
  @Get('categories/:categoryId/products')
  @ApiOperation({ summary: 'Get products by product (paginated)' })
  @ApiParam({
    name: 'categoryId',
    description: 'category ID',
    example: 'c1f7c8b2-1234-4abc-9abc-123456789abc',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'shoe' })
  @ApiResponse({ status: 200, description: 'Paginated products by product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductsByProduct(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.productService.getProductsByCategory(categoryId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
  }

  // =============================
  // GET PRODUCTS BY BRAND
  // =============================
  @Get('brands/:brandId/products')
  @ApiOperation({ summary: 'Get products by brand (paginated)' })
  @ApiParam({
    name: 'brandId',
    description: 'Brand ID',
    example: 'b2e9a111-5678-4def-9def-abcdef123456',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'nike' })
  @ApiResponse({ status: 200, description: 'Paginated products by brand' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async getProductsByBrand(
    @Param('brandId', ParseUUIDPipe) brandId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.productService.getProductsByBrand(brandId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
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
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  restoreProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.restoreProduct(id);
  }

  // =======================================
  // Permanently delete 1 soft-deleted one
  // =======================================
  @Delete('deleted/:id')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Permanently delete 1 soft-deleted product',
    description: 'Hard delete 1 product that is currently soft deleted',
  })
  @ApiResponse({
    status: 204,
    description: 'Soft-deleted product permanently removed',
  })
  async hardDeleteOneSoftDeletedProduct(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.productService.removeOneSoftDeletedProduct(id);
  }
}
