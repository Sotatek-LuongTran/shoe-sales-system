import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { PaymentEntity } from 'src/database/entities/payment.entity';
import { PaymentResponseDto } from 'src/shared/dto/payment/payment-response.dto';

@Exclude()
export class AdminPaymentResponseDto extends PaymentResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Order owner',
  })
  userId: string;

  constructor(payment: PaymentEntity) {
    super(payment);
    this.userId = payment.order.userId;
  }
}
