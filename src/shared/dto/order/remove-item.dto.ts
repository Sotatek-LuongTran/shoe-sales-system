import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class RemoveOrderItemDto {
  @ApiProperty({
    description: 'Id of the product',
  })
  @IsUUID()
  @IsUUID()
  productId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Value of the item',
    example: 'Light Blue',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  variantValue: string;
}
