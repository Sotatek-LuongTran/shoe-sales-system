import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive, IsString, IsUUID } from "class-validator";

export class AddToPendingOrderDto {
    @ApiProperty({ description: 'Product ID' })
    @IsUUID()
    productId: string;

    @ApiProperty({ description: 'Product ID' })
    @IsUUID()
    productVariantId: string;
  
    @ApiProperty({ description: 'Quantity' })
    @IsInt()
    @IsPositive()
    quantity: number;
  }
  