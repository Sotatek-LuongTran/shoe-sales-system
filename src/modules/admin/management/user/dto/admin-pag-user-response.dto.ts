import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { PaginationResponseDto } from "src/shared/dto/pagination-response.dto";

@Exclude()
export class AdminPaginationUserResponseDto {
    @Expose()
    @ApiProperty({
        description: 'Meta of pagination'
    })
    meta: PaginationResponseDto;

    @Expose()
    @ApiProperty({
        description: 'List of users'
    })
    users: AdminPaginationUserResponseDto[];
}