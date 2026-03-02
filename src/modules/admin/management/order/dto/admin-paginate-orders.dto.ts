import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";
import { PaginateOrdersDto } from "src/shared/dto/order/paginate-order.dto";

export class AdminPaginateOrdersDto extends PaginateOrdersDto {
    @IsUUID()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'User id'
    })
    userId: string;
}