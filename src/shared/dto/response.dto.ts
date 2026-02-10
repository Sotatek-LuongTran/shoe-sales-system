import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ResponseDto {
  @Expose()
  @ApiProperty({ example: 'id' })
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}
