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
  @ApiProperty({ example: 'avatars/user123/abc123.png'})
  logoKey: string

  constructor(brand: BrandEntity) {
    super(brand.id);
    Object.assign(this, {
      name: brand.name,
      description: brand.description,
      createAt: brand.createdAt,
      updateAt: brand.updatedAt,
      logoKey: brand.logoKey,
    });
  }
}
