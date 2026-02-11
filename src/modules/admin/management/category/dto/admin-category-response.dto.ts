import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { CategoryResponseDto } from "src/shared/dto/category/category-response.dto";

@Exclude()
export class AdminCategoryResponseDto extends CategoryResponseDto {
    @Expose()
    @ApiProperty({
        description: 'date',
        example: '2025-02-10T10:00:00Z',
    })
    deletedAt: Date;
}