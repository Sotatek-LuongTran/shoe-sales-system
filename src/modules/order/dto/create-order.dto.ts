import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  @ApiProperty({
    description: 'Variant id',
    example: 'id',
  })
  variantId: string;

  @IsInt()
  @Min(1)
  @ApiProperty({
    description: 'Quantity',
    example: '1',
  })
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ApiProperty({
    description: 'List of items',
    type: () => CreateOrderItemDto,
    isArray: true,
  })
  items: CreateOrderItemDto[];
}
