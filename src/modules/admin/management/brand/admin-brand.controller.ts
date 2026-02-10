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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBrandDto } from 'src/modules/brand/dto/create-brand.dto';
import { UpdateBrandDto } from 'src/modules/brand/dto/update-brand.dto';
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { AdminBrandService } from './admin-brand.service';
import { PaginateBrandsDto } from 'src/modules/brand/dto/paginate-brands.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('admins/brands')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@UseGuards(RolesGuard)
@ApiTags('Admin')
export class AdminBrandController {
  brandService: any;
  constructor(private readonly adminBrandService: AdminBrandService) {}

  // =============================
  // GET ALL BRANDS
  // =============================
  @Get()
  @ApiOperation({ summary: 'Get brands with pagination & filters' })
  @ApiResponse({
    status: 201,
    description: 'Brands get successfully',
  })
  @ApiQuery({ name: 'dto', required: true, type: PaginateBrandsDto })
  getList(@Query('dto') dto: PaginateBrandsDto) {
    return this.brandService.getBrandsPagination(dto);
  }

  // =============================
  // CREATE BRAND
  // =============================
  @Post()
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand created successfully',
  })
  create(@Body() dto: CreateBrandDto) {
    return this.adminBrandService.createBrand(dto);
  }

  // =============================
  // UPDATE BRAND
  // =============================
  @Patch(':id')
  @ApiOperation({ summary: 'Update a brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand updated successfully',
  })
  update(@Body() dto: UpdateBrandDto) {
    return this.adminBrandService.updateBrand(dto);
  }

  // =============================
  // DELETE BRAND
  // =============================
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminBrandService.deleteBrand(id);
  }

  // =============================
  // RESTORE DELETED BRAND
  // =============================
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted a brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  restoreBrand(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminBrandService.restoreBrand(id);
  }
}
