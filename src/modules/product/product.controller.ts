import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreateProductDto } from 'src/shared/dto/product/create-product.dto';
import { UpdateProductDto } from 'src/shared/dto/product/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { UserRole } from 'src/shared/enums/user.enum';
import { Roles } from 'src/shared/decorators/role.decorator';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ 
    status: 201, 
    description: 'Product created successfully'
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 201, 
    description: 'Product updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get products with pagination & filters' })
  @ApiResponse({ 
    status: 201, 
    description: 'Products get successfully'
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
    return this.productService.getProductsPagination({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      filters,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product detail' })
  @ApiResponse({ 
    status: 201, 
    description: 'Product get successfully'
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getOne(@Param('id') id: string) {
    return this.productService.getProduct(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Soft delete a product' })
  @ApiResponse({ 
    status: 201, 
    description: 'Product deleted successfully'
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
