import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { CategoryService } from './category.service';
import { PaginateCategoriesDto } from '../../shared/dto/category/paginate-categories.dto';
import { CategoryResponseDto } from 'src/shared/dto/category/category-response.dto';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
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
    type: CategoryResponseDto
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
    type: CategoryResponseDto
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.getCategory(id);
  }
}
