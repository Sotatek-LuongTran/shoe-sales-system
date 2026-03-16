import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { CategoryEntity } from "src/database/entities/category.entity";
import { ResponseDto } from "src/shared/dto/response.dto";

// @Exclude()
export class CategoryResponseDto extends ResponseDto {
    @Expose()
    @ApiProperty({
        example: 'Football shoe'
    })
    name: string;
    @Expose()
    @ApiProperty({
        example: 'To play football'
    })
    description?: string;
    @Expose()
    @ApiProperty({ example: '2025-02-10T10:00:00Z' })
    createdAt: Date;

    @Expose()
    @ApiProperty({ example: '2025-02-10T10:00:00Z' })
    updatedAt: Date;

    @Expose()
    @ApiProperty({ example: 'ac5dd95e-d78f-43e6-97aa-28eed93a0430?X-Amz-Algorithm=AWS4-HMAC-SHA256&X...'})
    logoUrl: string

    constructor(category: CategoryEntity) {
        super(category.id)
        Object.assign(this, {
            name: category.name,
            description: category.description,
            createAt: category.createdAt,
            updateAt: category.updatedAt,
        })
    }
}