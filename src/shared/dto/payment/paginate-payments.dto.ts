import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginateDto } from 'src/shared/dto/paginate.dto';

export class PaginatePaymentsDto extends PaginateDto {
    @IsUUID()
    @IsOptional()
    @ApiProperty({
        description: 'User id',
        example: 'id'
    })
    userId?: string;
}
