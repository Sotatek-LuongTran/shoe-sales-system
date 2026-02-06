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
import { UserRole } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { CreateBrandDto } from 'src/shared/dto/brand/create-brand.dto';
import { UpdateBrandDto } from 'src/shared/dto/brand/update-brand.dto';

@ApiTags('Brands')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  // =============================
  // CREATE BRAND
  // =============================
  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.createBrand(dto);
  }

  // =============================
  // UPDATE BRAND
  // =============================
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(@Body() dto: UpdateBrandDto) {
    return this.brandService.updateBrand(dto);
  }

  // =============================
  // GET ALL BRANDS
  // =============================
  @Get()
  @ApiOperation({ summary: 'Get brands with pagination & filters' })
  @ApiResponse({
    status: 201,
    description: 'Brands get successfully',
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
  ) {
    return this.brandService.getBrandsPagination({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
    });
  }

  // =============================
  // GET A BRAND
  // =============================
  @Get(':id')
  @ApiOperation({ summary: 'Get brand detail' })
  @ApiResponse({
    status: 201,
    description: 'Brand get successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getOne(@Param('id') id: string) {
    return this.brandService.getBrand(id);
  }

  // =============================
  // DELETE BRAND
  // =============================
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Soft delete a brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id') id: string) {
    return this.brandService.deleteBrand(id);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Restore a soft-deleted a brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  restoreBrand(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandService.restoreBrand(id);
  }

  // ===============================
  // Get soft-deleted brands
  // ===============================
  @Get('deleted')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get soft-deleted brands',
    description: 'Retrieve brands that were soft deleted (recycle bin)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'nike',
    description: 'Search by brand name or description',
  })
  @ApiResponse({
    status: 200,
    description: 'List of soft-deleted brands',
  })
  async getSoftDeletedBrands(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.brandService.getSoftDeletedBrandsPagination({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
    });
  }
  // =======================================
  // Permanently delete soft-deleted ones
  // =======================================
  @Delete('deleted')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Permanently delete soft-deleted brands',
    description: 'Hard delete all brands that are currently soft deleted',
  })
  @ApiResponse({
    status: 204,
    description: 'Soft-deleted brands permanently removed',
  })
  async hardDeleteSoftDeletedBrands() {
    await this.brandService.removeSoftDeletedBrands();
  }

  // =======================================
  // Permanently delete 1 soft-deleted one
  // =======================================
  @Delete('deleted/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Permanently delete 1 soft-deleted brand',
    description: 'Hard delete 1 brand that is currently soft deleted',
  })
  @ApiResponse({
    status: 204,
    description: 'Soft-deleted brand permanently removed',
  })
  async hardDeleteOneSoftDeletedBrand(@Param('id', ParseUUIDPipe) id: string) {
    await this.brandService.removeOneSoftDeletedBrand(id);
  }
}
