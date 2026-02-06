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
import { CreateCategoryDto } from 'src/shared/dto/category/create-category.dto';
import { CategoryService } from './category.service';
import { UpdateCategoryDto } from 'src/shared/dto/category/update-category';

@ApiTags('categories')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // =============================
  // CREATE CATEGORY
  // =============================
  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'category created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  // =============================
  // UPDATE CATEGORY
  // =============================
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({
    status: 201,
    description: 'Product updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(@Body() dto: UpdateCategoryDto) {
    return this.categoryService.updateCategory(dto);
  }

  // =============================
  // GET ALL CATEGORIES
  // =============================
  @Get()
  @ApiOperation({ summary: 'Get categories with pagination & filters' })
  @ApiResponse({
    status: 201,
    description: 'Categories get successfully',
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
  ) {
    return this.categoryService.getCategorysPagination({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
    });
  }

  // =============================
  // GET A CATEGORY
  // =============================
  @Get(':id')
  @ApiOperation({ summary: 'Get category detail' })
  @ApiResponse({
    status: 201,
    description: 'Category get successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getOne(@Param('id') id: string) {
    return this.categoryService.getCategory(id);
  }

  // =============================
  // DELETE CATEGORY
  // =============================
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Soft delete a category' })
  @ApiResponse({
    status: 201,
    description: 'Category deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
  // =============================
  // RESTORE DELETED CATEGORY
  // =============================
  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Restore a soft-deleted a category' })
  @ApiResponse({
    status: 201,
    description: 'Category deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  restoreCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.restoreCategory(id);
  }

  // ===============================
  // Get soft-deleted products
  // ===============================
  @Get('deleted')
  @Roles(UserRole.ADMIN)
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
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.categoryService.getSoftDeletedCategoriesPagination({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
    });
  }
  // =======================================
  // Permanently delete soft-deleted ones
  // =======================================
  @Delete('deleted')
  @Roles(UserRole.ADMIN)
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
    await this.categoryService.removeSoftDeletedCategories();
  }

  // =======================================
  // Permanently delete 1 soft-deleted one
  // =======================================
  @Delete('deleted/:id')
  @Roles(UserRole.ADMIN)
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
    await this.categoryService.removeOneSoftDeletedCategory(id);
  }
}
