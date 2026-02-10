import { Exclude, Expose } from "class-transformer";
import { PaginationResponseDto } from "../pagination-response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { CategoryResponseDto } from "./category-response.dto";

@Exclude()
export class PaginationCategoryResponseDto {
    @Expose()
    @ApiProperty({
        description: 'Meta of pagination'
    })
    meta: PaginationResponseDto;

    @Expose()
    @ApiProperty({
        description: 'List of categories'
    })
    categories: CategoryResponseDto[];
}