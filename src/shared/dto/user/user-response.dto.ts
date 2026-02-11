import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ResponseDto } from '../response.dto';
import { UserEntity } from 'src/database/entities/user.entity';

@Exclude()
export class UserResponseDto extends ResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Name',
    example: 'John Terry'
  })
  name: string;
  @Expose()
  @ApiProperty({
    description: 'email',
    example: 'example@email.com'
  })
  email: string;

  constructor(user: UserEntity) {
    super(user.id)
    Object.assign(this, user)
  }
}
