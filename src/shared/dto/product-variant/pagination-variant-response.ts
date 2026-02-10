import { Exclude, Expose } from "class-transformer";
import { PaginationResponseDto } from "../pagination-response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { ProductVariantResponseDto } from "./product-variant-response.dto";

@Exclude()
export class PaginationVariantResponseDto {
    @Expose()
    @ApiProperty({
        description: 'Meta of pagination'
    })
    meta: PaginationResponseDto;

    @Expose()
    @ApiProperty({
        description: 'List of variants'
    })
    variants: ProductVariantResponseDto[];
}