import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminProductService } from './admin-product.service';
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from 'src/modules/admin/management/product/dto/create-product.dto';
import { PaginateProductsDto } from 'src/shared/dto/product/paginate-products.dto';
import { UpdateProductDto } from 'src/modules/admin/management/product/dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminProductResponseDto } from './dto/admin-product-response.dto';
import { AdminPaginationProductResponseDto } from './dto/admin-pag-product-response.dto';

@Controller('admin/products')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@UseGuards(RolesGuard)
@ApiTags('Admin')
export class AdminProductController {
    constructor(private readonly adminProductService: AdminProductService) {
    }
  // =============================
  // CREATE PRODUCT
  // =============================
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: AdminProductResponseDto,
  })
  create(@Body() dto: CreateProductDto) {
    return this.adminProductService.createProduct(dto);
  }

  // =============================
  // GET ALL PRODUCTS
  // =============================
  @Get()
  @ApiOperation({ summary: 'Get products with pagination & filters' })
  @ApiResponse({
    status: 201,
    description: 'Products get successfully',
    type: AdminPaginationProductResponseDto,
  })
  @ApiQuery({ name: 'dto', required: true, type: PaginateProductsDto })
  getList(@Query() dto: PaginateProductsDto) {
    return this.adminProductService.getProductsPagination(dto);
  }

  // =======================================
  // Permanently delete soft-deleted ones
  // =======================================
  @Delete('deleted')
  @ApiOperation({
    summary: 'Permanently delete soft-deleted products',
    description: 'Hard delete all products that are currently soft deleted',
  })
  @ApiResponse({
    status: 204,
    description: 'Soft-deleted products permanently removed',
  })
  async hardDeleteSoftDeletedProducts() {
    return await this.adminProductService.removeSoftDeletedProducts();
  }

  // =============================
  // UPDATE PRODUCT
  // =============================
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({
    status: 201,
    description: 'Product updated successfully',
    type: AdminProductResponseDto,
  })
  update(@Body() dto: UpdateProductDto) {
    return this.adminProductService.updateProduct(dto);
  }

  // =============================
  // GET PRODUCT
  // =============================
  @Get(':id')
  @ApiOperation({ summary: 'Get product detail' })
  @ApiResponse({
    status: 201,
    description: 'Product get successfully',
    type: AdminProductResponseDto,
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminProductService.getProduct(id);
  }
}
