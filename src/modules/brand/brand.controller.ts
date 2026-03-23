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
import { ImageKeyInterceptor } from 'src/shared/interceptors/image-key.interceptor';
import { ApiBaseResponse } from 'src/shared/decorators/api-base-response.decorator';

@ApiTags('Brands')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  // =============================
  // GET ALL BRANDS
  // =============================
  @Get()
  @ApiOperation({ summary: 'Get brands with pagination & filters' })
  @ApiPaginatedResponse(BrandResponseDto)
  @UseInterceptors(ClassSerializerInterceptor, ImageKeyInterceptor)
  getList(@Query() dto: PaginateBrandsDto) {
    return this.brandService.getBrandsPagination(dto);
  }

  // =============================
  // GET A BRAND
  // =============================
  @Get(':id')
  @ApiOperation({ summary: 'Get brand detail' })
  @ApiBaseResponse(BrandResponseDto)
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @UseInterceptors(ClassSerializerInterceptor, ImageKeyInterceptor)
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandService.getBrand(id);
  }
}
