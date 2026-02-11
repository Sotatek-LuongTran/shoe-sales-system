import { Exclude, Expose } from "class-transformer";
import { PaginationResponseDto } from "../pagination-response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { BrandResponseDto } from "./brand-response.dto";


@Exclude()
export class PaginationBrandResponseDto {
    @Expose()
    @ApiProperty({
        description: 'Meta of pagination'
    })
    meta: PaginationResponseDto;

    @Expose()
    @ApiProperty({
        description: 'List of brands'
    })
    brands: BrandResponseDto[];
}