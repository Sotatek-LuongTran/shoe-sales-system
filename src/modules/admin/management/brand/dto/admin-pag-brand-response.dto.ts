import { PaginationResponseDto } from "src/shared/dto/pagination-response.dto";
import { AdminBrandResponseDto } from "./admin-brand-response.dto";
import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class AdminPaginationBrandResponseDto {
    @Expose()
    @ApiProperty({
        description: 'List of brands'
    })
    brands: AdminBrandResponseDto[];
}