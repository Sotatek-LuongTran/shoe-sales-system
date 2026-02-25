import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { CreateUserDto } from 'src/modules/auth/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/admin/management/user/dto/update-user.dto';
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserResponseDto } from 'src/shared/dto/user/user-response.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { PaginateUsersDto } from 'src/shared/dto/user/paginate-user.dto';
import { ApiPaginatedResponse } from 'src/shared/decorators/api-paginated-response.decorator';
import { AdminUserResponseDto } from './dto/admin-user-response.dto';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Post()
  @ApiOperation({ summary: 'Create an user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminUserService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 201,
    description: 'Users get successfully',
  })
  @ApiPaginatedResponse(AdminUserResponseDto)
  @UseInterceptors(ClassSerializerInterceptor)
  getList(@Query() dto: PaginateUsersDto) {
    return this.adminUserService.getAllUsersPagination(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an user' })
  @ApiResponse({
    status: 201,
    description: 'User get successfully',
    type: UserResponseDto,
  })
  findUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminUserService.findUserById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an user' })
  @ApiResponse({
    status: 201,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminUserService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate an user' })
  @ApiResponse({
    status: 201,
    description: 'User deactivated successfully',
  })
  deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminUserService.deactivateUser(id);
  }

  @Put('restore/:id')
  @ApiOperation({ summary: 'Restore an user' })
  @ApiResponse({
    status: 201,
    description: 'User restored successfully',
  })
  restoreUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminUserService.restoreUser(id);
  }
}
