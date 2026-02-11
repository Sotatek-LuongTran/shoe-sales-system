import { Exclude, Expose } from "class-transformer";
import { PaginationResponseDto } from "../pagination-response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { PaymentResponseDto } from "./payment-response.dto";

@Exclude()
export class PaginationPaymentResponseDto {
    @Expose()
    @ApiProperty({
        description: 'Meta of pagination'
    })
    meta: PaginationResponseDto;

    @Expose()
    @ApiProperty({
        description: 'List of orders'
    })
    orders: PaymentResponseDto[];
}