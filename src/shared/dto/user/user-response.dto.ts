import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
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
}
