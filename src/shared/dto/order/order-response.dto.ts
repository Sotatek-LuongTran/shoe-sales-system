import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { OrderItemResponseDto } from './order-item-response.dto';
import {
  OrderPaymentStatusEnum,
  OrderStatusEnum,
} from 'src/shared/enums/order.enum';
import { OrderEntity } from 'src/database/entities/order.entity';
import { ResponseDto } from '../response.dto';

// @Exclude()
export class OrderResponseDto extends ResponseDto {
  @Expose()
  @ApiProperty({
    description: 'List of order items',
    isArray: true,
    type: () => OrderItemResponseDto,
  })
  orderItems: OrderItemResponseDto[];

  @Expose()
  @ApiProperty({
    enum: OrderStatusEnum,
    example: OrderStatusEnum.PENDING,
  })
  status: OrderStatusEnum;

  @Expose()
  @ApiProperty({
    enum: OrderPaymentStatusEnum,
    example: OrderPaymentStatusEnum.UNPAID,
  })
  paymentStatus: OrderPaymentStatusEnum;

  @Expose()
  @ApiProperty({
    description: 'Total price of order',
  })
  totalPrice: number;

  @Expose()
  @ApiProperty({ example: '2025-02-10T10:00:00Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Payment id'})
  paymentId: string;

  constructor(order: OrderEntity) {
    super(order.id);

    this.status = order.status;
    this.paymentStatus = order.paymentStatus;
    this.totalPrice = order.totalPrice;
    this.createdAt = order.createdAt;

    this.orderItems =
      order.items?.map((item) => new OrderItemResponseDto(item)) ?? [];

    this.paymentId = order.payment?.id ?? null;
  }
}
