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
import { AdminCategoryService } from './admin-category.service';
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from 'src/modules/admin/management/category/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/modules/admin/management/category/dto/update-category';
import { PaginateCategoriesDto } from 'src/modules/admin/management/category/dto/paginate-categories.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin/categories')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@UseGuards(RolesGuard)
@ApiTags('Admin')
export class AdminCategoryController {
  constructor(private readonly adminCategoryService: AdminCategoryService) {}
  // =============================
  // CREATE CATEGORY
  // =============================
  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'category created successfully',
  })
  create(@Body() dto: CreateCategoryDto) {
    return this.adminCategoryService.createCategory(dto);
  }

  // =============================
  // UPDATE CATEGORY
  // =============================
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({
    status: 201,
    description: 'Product updated successfully',
  })
  update(@Body() dto: UpdateCategoryDto) {
    return this.adminCategoryService.updateCategory(dto);
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
  @ApiQuery({ name: 'dto', required: true, type: PaginateCategoriesDto })
  getList(@Query('dto') dto: PaginateCategoriesDto) {
    return this.adminCategoryService.getCategoriesPagination(dto);
  }

  // =============================
  // DELETE CATEGORY
  // =============================
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a category' })
  @ApiResponse({
    status: 201,
    description: 'Category deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminCategoryService.deleteCategory(id);
  }

  // =============================
  // RESTORE DELETED CATEGORY
  // =============================
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted a category' })
  @ApiResponse({
    status: 201,
    description: 'Category deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  restoreCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminCategoryService.restoreCategory(id);
  }
}
