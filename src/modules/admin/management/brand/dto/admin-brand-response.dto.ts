import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { BrandEntity } from "src/database/entities/brand.entity";
import { BrandResponseDto } from "src/shared/dto/brand/brand-response.dto";
import { BrandStatusEnum } from "src/shared/enums/brand.enum";

// @Exclude()
export class AdminBrandResponseDto extends BrandResponseDto {
    @Expose()
    @ApiProperty({
        description: 'date',
        example: '2025-02-10T10:00:00Z',
    })
    deletedAt: Date | null;

    @Expose()
    @ApiProperty({
        description: 'Status'
    })
    status: BrandStatusEnum;

    constructor(brand: BrandEntity) {
        super(brand);
        this.deletedAt = brand.deletedAt;
        this.status = brand.status;
    }
}