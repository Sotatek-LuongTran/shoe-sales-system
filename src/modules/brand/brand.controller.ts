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
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { CreateBrandDto } from 'src/modules/brand/dto/create-brand.dto';
import { UpdateBrandDto } from 'src/modules/brand/dto/update-brand.dto';

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
  @Roles(UserRoleEnum.ADMIN)
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
  @Roles(UserRoleEnum.ADMIN)
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
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandService.getBrand(id);
  }

  // =============================
  // DELETE BRAND
  // =============================
  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Soft delete a brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandService.deleteBrand(id);
  }

  @Patch(':id/restore')
  @Roles(UserRoleEnum.ADMIN)
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
}
