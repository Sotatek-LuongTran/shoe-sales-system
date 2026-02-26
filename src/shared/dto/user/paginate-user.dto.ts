import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginateDto } from '../paginate.dto';
import { UserStatusEnum } from 'src/shared/enums/user.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class PaginateUsersDto extends PaginateDto {
  @ApiPropertyOptional({
    description: 'Status of the product',
    example: UserStatusEnum.ACTIVE,
    enum: UserStatusEnum,
  })
  @IsEnum(UserStatusEnum)
  @IsOptional()
  status?: UserStatusEnum;
}
