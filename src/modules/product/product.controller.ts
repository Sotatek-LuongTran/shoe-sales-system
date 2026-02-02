import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
  } from '@nestjs/common';
  import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
  import { ProductService } from './product.service';
  import { CreateProductDto } from 'src/shared/dto/product/create-product.dto';
  import { UpdateProductDto } from 'src/shared/dto/product/update-product.dto';
  
  @ApiTags('Products')
  @ApiBearerAuth('access-token')
  @Controller('products')
  export class ProductController {
    constructor(private readonly productService: ProductService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new product' })
    create(@Body() dto: CreateProductDto) {
      return this.productService.createProduct(dto);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a product' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
    update(
      @Param('id') id: string,
      @Body() dto: UpdateProductDto,
    ) {
      return this.productService.updateProduct(id, dto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get products with pagination & filters' })
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
    @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
    getOne(@Param('id') id: string) {
      return this.productService.getProduct(id);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Soft delete a product' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
    remove(@Param('id') id: string) {
      return this.productService.deleteProduct(id);
    }
  }
  