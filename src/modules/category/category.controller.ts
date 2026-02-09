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
import { CreateCategoryDto } from 'src/modules/category/dto/create-category.dto';
import { CategoryService } from './category.service';
import { UpdateCategoryDto } from 'src/modules/category/dto/update-category';
import { PaginateCategoriesDto } from './dto/paginate-categories.dto';

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
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'category created successfully',
  })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  // =============================
  // UPDATE CATEGORY
  // =============================
  @Patch(':id')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({
    status: 201,
    description: 'Product updated successfully',
  })
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
  @ApiQuery({ name: 'dto', required: true, type: PaginateCategoriesDto })
  getList(
    @Query('dto') dto: PaginateCategoriesDto,
  ) {
    return this.categoryService.getCategoriesPagination(dto);
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
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.getCategory(id);
  }

  // =============================
  // DELETE CATEGORY
  // =============================
  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Soft delete a category' })
  @ApiResponse({
    status: 201,
    description: 'Category deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.deleteCategory(id);
  }
  // =============================
  // RESTORE DELETED CATEGORY
  // =============================
  @Patch(':id/restore')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Restore a soft-deleted a category' })
  @ApiResponse({
    status: 201,
    description: 'Category deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  restoreCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.restoreCategory(id);
  }
}
