import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { BrandResponseDto } from "src/shared/dto/brand/brand-response.dto";

@Exclude()
export class AdminBrandResponseDto extends BrandResponseDto {
    @Expose()
    @ApiProperty({
        description: 'date',
        example: '2025-02-10T10:00:00Z',
    })
    deletedAt: Date;
}