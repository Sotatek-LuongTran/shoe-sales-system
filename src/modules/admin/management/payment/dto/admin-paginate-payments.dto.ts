import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginatePaymentsDto } from 'src/shared/dto/payment/paginate-payments.dto';

export class AdminPaginatePaymentsDto extends PaginatePaymentsDto {
  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'User id'
  })
  userId: string;
}
