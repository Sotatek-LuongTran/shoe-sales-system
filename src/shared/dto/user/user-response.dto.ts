import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ResponseDto } from '../response.dto';

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
}
