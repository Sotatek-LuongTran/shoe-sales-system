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
import { BrandService } from './brand.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginateBrandsDto } from '../../shared/dto/brand/paginate-brands.dto';
import { BrandResponseDto } from 'src/shared/dto/brand/brand-response.dto';
import { ApiPaginatedResponse } from 'src/shared/decorators/api-paginated-response.decorator';

@ApiTags('Brands')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  // =============================
  // GET ALL BRANDS
  // =============================
  @Get()
  @ApiOperation({ summary: 'Get brands with pagination & filters' })
  @ApiResponse({
    status: 201,
    description: 'Brands get successfully'
  })
  @ApiPaginatedResponse(BrandResponseDto)
  @UseInterceptors(ClassSerializerInterceptor)
  getList(@Query() dto: PaginateBrandsDto) {
    return this.brandService.getBrandsPagination(dto);
  }

  // =============================
  // GET A BRAND
  // =============================
  @Get(':id')
  @ApiOperation({ summary: 'Get brand detail' })
  @ApiResponse({
    status: 201,
    description: 'Brand get successfully',
    type: BrandResponseDto
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @UseInterceptors(ClassSerializerInterceptor)
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandService.getBrand(id);
  }
}
