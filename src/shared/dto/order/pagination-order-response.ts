import { Exclude, Expose } from "class-transformer";
import { PaginationResponseDto } from "../pagination-response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { OrderResponseDto } from "./order-response.dto";

@Exclude()
export class PaginationOrderResponseDto {
    @Expose()
    @ApiProperty({
        description: 'Meta of pagination'
    })
    meta: PaginationResponseDto;

    @Expose()
    @ApiProperty({
        description: 'List of orders'
    })
    orders: OrderResponseDto[];
}