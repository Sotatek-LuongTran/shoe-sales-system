import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { CategoryEntity } from "src/database/entities/category.entity";
import { CategoryResponseDto } from "src/shared/dto/category/category-response.dto";
import { CategoryStatusEnum } from "src/shared/enums/category.enum";

// @Exclude()
export class AdminCategoryResponseDto extends CategoryResponseDto {
    @Expose()
    @ApiProperty({
        description: 'date',
        example: '2025-02-10T10:00:00Z',
    })
    deletedAt: Date | null;

    @Expose()
    @ApiProperty({
        description: 'Status',
    })
    status: CategoryStatusEnum;

    constructor(category: CategoryEntity) {
        super(category)
        this.deletedAt = category.deletedAt;
        this.status = category.status;
    }
}