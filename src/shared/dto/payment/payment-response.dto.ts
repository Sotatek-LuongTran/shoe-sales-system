import { ResponseDto } from '../response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { PaymentStatusEnum } from 'src/shared/enums/payment.enum';
import { PaymentEntity } from 'src/database/entities/payment.entity';

// @Exclude()
export class PaymentResponseDto extends ResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Total price of order',
  })
  amount: number;

  @Expose()
  @ApiProperty({
    description: 'The status for the payment',
    enum: PaymentStatusEnum,
    example: PaymentStatusEnum.PENDING,
  })
  paymentStatus: PaymentStatusEnum;

  @Expose()
  @ApiProperty({
    description: 'Order of the payment',
  })
  orderId: string;

  constructor(payment: PaymentEntity) {
    super(payment.id);

    this.amount = Number(payment.amount);
    this.paymentStatus = payment.paymentStatus;

    this.orderId = payment.orderId;
  }
}
