import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
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
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { PaginateBrandsDto } from '../../shared/dto/brand/paginate-brands.dto';
import { BrandResponseDto } from 'src/shared/dto/brand/brand-response.dto';
import { PaginationBrandResponseDto } from 'src/shared/dto/brand/pagination-brand-response';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';

@ApiTags('Brands')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.USER)
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
    description: 'Brands get successfully',
    type: PaginationBrandResponseDto,
  })
  @ApiQuery({ name: 'dto', required: true, type: PaginateBrandsDto })
  getList(@Query('dto') dto: PaginateBrandsDto) {
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
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandService.getBrand(id);
  }
}
