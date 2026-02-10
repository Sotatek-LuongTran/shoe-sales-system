import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { OrderItemEntity } from 'src/database/entities/order-item.entity';
import { GenderEnum, ProductTypeEnum } from 'src/shared/enums/product.enum';
import { ResponseDto } from '../response.dto';

@Exclude()
export class OrderItemResponseDto extends ResponseDto {

  @Expose()
  @ApiProperty({
    description: 'Value of the item',
    example: 'Light Blue',
  })
  variantValue: string;

  @Expose()
  @ApiProperty({
    description: 'Stock of the item',
    example: '10',
  })
  quantity: number;

  @Expose()
  @ApiProperty({
    description: 'Price of the item',
    example: '100',
  })
  price: number;

  @Expose()
  @ApiProperty({
    description: 'Final price of the item',
    example: '90',
  })
  finalPrice: number;
  
  @Expose()
  @ApiProperty({
    description: 'Name of the product',
    example: 'A very useful thing',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'Description of the product',
    example: 'A thing that is very useful as its name',
    required: false,
    maxLength: 500,
  })
  description?: string;

  @Expose()
  @ApiProperty({
    description: 'Type of the product',
    enum: ProductTypeEnum,
    example: ProductTypeEnum.SHOE,
  })
  productType: ProductTypeEnum;

  @Expose()
  @ApiProperty({
    description: 'The suitable gender for the product',
    enum: GenderEnum,
    example: GenderEnum.UNISEX,
  })
  gender: GenderEnum;

  constructor(orderItem: OrderItemEntity) {
    super(orderItem.id)
    Object.assign(this, orderItem)
  }
}
