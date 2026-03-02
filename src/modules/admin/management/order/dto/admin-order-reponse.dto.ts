import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { OrderEntity } from 'src/database/entities/order.entity';
import { OrderResponseDto } from 'src/shared/dto/order/order-response.dto';

@Exclude()
export class AdminOrderResponseDto extends OrderResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Order owner',
  })
  userId: string;

  constructor(order: OrderEntity) {
    super(order);
    this.userId = order.userId;
  }
}
