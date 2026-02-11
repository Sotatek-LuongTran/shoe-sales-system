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
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { Roles } from 'src/shared/decorators/role.decorator';
import { PaginateProductsDto } from '../../shared/dto/product/paginate-products.dto';
import { ProductResponseDto } from 'src/shared/dto/product/product-respose.dto';
import { PaginationProductResponseDto } from 'src/shared/dto/product/pagination-product-response';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.USER)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // =============================
  // GET ALL PRODUCTS
  // =============================
  @Get()
  @ApiOperation({ summary: 'Get products with pagination & filters' })
  @ApiResponse({
    status: 201,
    description: 'Products get successfully',
    type: PaginationProductResponseDto,
  })
  @ApiQuery({ name: 'dto', required: true, type: PaginateProductsDto })
  getList(@Query() dto: PaginateProductsDto) {
    return this.productService.getProductsPagination(dto);
  }

  // =============================
  // GET PRODUCT
  // =============================
  @Get(':id')
  @ApiOperation({ summary: 'Get product detail' })
  @ApiResponse({
    status: 201,
    description: 'Product get successfully',
    type: ProductResponseDto,
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.getProduct(id);
  }
}
