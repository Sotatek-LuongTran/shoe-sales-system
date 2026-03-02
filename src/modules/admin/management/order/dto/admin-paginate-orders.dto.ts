import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";
import { PaginateOrdersDto } from "src/shared/dto/order/paginate-order.dto";

export class AdminPaginateOrdersDto extends PaginateOrdersDto {
    @IsUUID()
    @IsOptional()
    @ApiProperty({
        description: 'User id',
        example: 'id'
    })
    userId: string;
}