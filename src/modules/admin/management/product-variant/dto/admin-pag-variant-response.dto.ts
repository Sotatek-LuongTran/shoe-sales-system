import { PaginationResponseDto } from "src/shared/dto/pagination-response.dto";
import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { AdminVariantResponseDto } from "./admin-variant-response.dto";

@Exclude()
export class AdminPaginationVariantResponseDto {
    @Expose()
    @ApiProperty({
        description: 'Meta of pagination'
    })
    meta: PaginationResponseDto;

    @Expose()
    @ApiProperty({
        description: 'List of variants'
    })
    variants: AdminVariantResponseDto[];
}