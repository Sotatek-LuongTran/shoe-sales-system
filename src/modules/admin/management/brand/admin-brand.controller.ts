import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBrandDto } from 'src/modules/admin/management/brand/dto/create-brand.dto';
import { UpdateBrandDto } from 'src/modules/admin/management/brand/dto/update-brand.dto';
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { AdminBrandService } from './admin-brand.service';
import { PaginateBrandsDto } from 'src/shared/dto/brand/paginate-brands.dto';
import { AdminBrandResponseDto } from './dto/admin-brand-response.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { ApiPaginatedResponse } from 'src/shared/decorators/api-paginated-response.decorator';
import { ImageKeyInterceptor } from 'src/shared/interceptors/image-key.interceptor';

@Controller('admins/brands')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@ApiTags('Admin')
export class AdminBrandController {
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
  @ApiPaginatedResponse(AdminBrandResponseDto)
  @UseInterceptors(ClassSerializerInterceptor, ImageKeyInterceptor)
  getList(@Query() dto: PaginateBrandsDto) {
    return this.adminBrandService.getBrandsPagination(dto);
  }

  // =============================
  // CREATE BRAND
  // =============================
  @Post()
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand created successfully',
    type: AdminBrandResponseDto,
  })
  @UseInterceptors(ClassSerializerInterceptor, ImageKeyInterceptor)
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

  // =============================
  // UPLOAD BRAND LOGO
  // =============================
  @Post(':id/logo/:key')
  @ApiOperation({ summary: 'Upload brand logo' })
  @ApiResponse({
    status: 201,
    description: 'Brand logo uploaded successfully',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'key', type: 'string' })
  async uploadBrandLogo(@Param('id') id: string, @Param('key') key: string) {
    return this.adminBrandService.uploadBrandLogo(id, key);
  }
}
