import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginatePaymentsDto } from 'src/shared/dto/payment/paginate-payments.dto';

export class AdminPaginatePaymentsDto extends PaginatePaymentsDto {
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'User id',
    example: 'id',
  })
  userId: string;
}
