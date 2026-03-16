import { Exclude, Expose } from 'class-transformer';
import { ResponseDto } from '../response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { VariantImageEntity } from 'src/database/entities/variant-image.entity';

@Exclude()
export class VariantImageResponseDto extends ResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Image key',
    example:
      'ac5dd95e-d78f-43e6-97aa-28eed93a0430?X-Amz-Algorithm=AWS4-HMAC-SHA256&X...',
  })
  imageKey: string;

  constructor(image: VariantImageEntity) {
    super(image.id);
    Object.assign(this, image);
  }
}
