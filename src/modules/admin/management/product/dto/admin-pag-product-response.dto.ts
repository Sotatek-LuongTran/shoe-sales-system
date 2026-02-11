import { PaginationResponseDto } from "src/shared/dto/pagination-response.dto";
import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { AdminProductResponseDto } from "./admin-product-response.dto";

@Exclude()
export class AdminPaginationProductResponseDto {
    @Expose()
    @ApiProperty({
        description: 'Meta of pagination'
    })
    meta: PaginationResponseDto;

    @Expose()
    @ApiProperty({
        description: 'List of products'
    })
    products: AdminProductResponseDto[];
}