import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { CategoryService } from './category.service';
import { PaginateCategoriesDto } from '../../shared/dto/category/paginate-categories.dto';
import { CategoryResponseDto } from 'src/shared/dto/category/category-response.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { ApiPaginatedResponse } from 'src/shared/decorators/api-paginated-response.decorator';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.USER)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // =============================
  // GET ALL CATEGORIES
  // =============================
  @Get()
  @ApiOperation({ summary: 'Get categories with pagination & filters' })
  @ApiResponse({
    status: 201,
    description: 'Categories get successfully',
  })
  @ApiPaginatedResponse(CategoryResponseDto)
  @UseInterceptors(ClassSerializerInterceptor)
  getList(
    @Query() dto: PaginateCategoriesDto,
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
    type: CategoryResponseDto
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @UseInterceptors(ClassSerializerInterceptor)
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.getCategory(id);
  }
}
