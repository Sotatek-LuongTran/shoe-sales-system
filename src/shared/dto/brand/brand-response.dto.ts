import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { BrandEntity } from 'src/database/entities/brand.entity';
import { ResponseDto } from 'src/shared/dto/response.dto';

// @Exclude()
export class BrandResponseDto extends ResponseDto {
  @Expose()
  @ApiProperty({
    example: 'Adidoos',
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: 'Sport gear brand',
  })
  description?: string;

  @Expose()
  @ApiProperty({ example: '2025-02-10T10:00:00Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2025-02-10T10:00:00Z' })
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    example:
      'ac5dd95e-d78f-43e6-97aa-28eed93a0430?X-Amz-Algorithm=AWS4-HMAC-SHA256&X...',
  })
  logoUrl: string;

  constructor(brand: BrandEntity) {
    super(brand.id);
    Object.assign(this, {
      name: brand.name,
      description: brand.description,
      createAt: brand.createdAt,
      updateAt: brand.updatedAt,
    });
  }
}
