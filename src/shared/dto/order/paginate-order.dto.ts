import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";
import { PaginateDto } from "src/shared/dto/paginate.dto";

export class PaginateOrdersDto extends PaginateDto {
    @IsUUID()
    @IsOptional()
    @ApiProperty({
        description: 'User id',
        example: 'id'
    })
    userId?: string;
}