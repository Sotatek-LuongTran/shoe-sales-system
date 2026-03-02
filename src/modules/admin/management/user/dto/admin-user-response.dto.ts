import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { UserEntity } from 'src/database/entities/user.entity';
import { UserResponseDto } from 'src/shared/dto/user/user-response.dto';
import { UserStatusEnum } from 'src/shared/enums/user.enum';

@Exclude()
export class AdminUserResponseDto extends UserResponseDto {
  @Expose()
  @ApiProperty({
    description: 'date',
    example: '2025-02-10T10:00:00Z',
  })
  deletedAt: Date | null;

  @Expose()
  @ApiProperty({
    description: 'status',
  })
  status: UserStatusEnum;

  constructor(user: UserEntity) {
    super(user);
    this.deletedAt = user.deletedAt;
    this.status = user.status;
  }
}
