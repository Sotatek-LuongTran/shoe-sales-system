import { PaginationResponseDto } from "src/shared/dto/pagination-response.dto";
import { AdminCategoryResponseDto } from "./admin-category-response.dto";
import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class AdminPaginationCategoryResponseDto {
    @Expose()
    @ApiProperty({
        description: 'Meta of pagination'
    })
    meta: PaginationResponseDto;

    @Expose()
    @ApiProperty({
        description: 'List of categories'
    })
    categories: AdminCategoryResponseDto[];
}