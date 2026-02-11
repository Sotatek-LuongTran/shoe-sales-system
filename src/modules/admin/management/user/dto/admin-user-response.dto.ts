import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { UserResponseDto } from "src/shared/dto/user/user-response.dto";

@Exclude()
export class AdminUserResponseDto extends UserResponseDto {
    @Expose()
    @ApiProperty({
        description: 'date',
        example: '2025-02-10T10:00:00Z',
    })
    deletedAt: Date;
}