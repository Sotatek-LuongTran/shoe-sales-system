import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive, IsString, IsUUID } from "class-validator";

export class AddToPendingOrderDto {
    @ApiProperty({ description: 'Product ID' })
    @IsUUID()
    productId: string;
  
    @ApiProperty({ description: 'Variant value (size / color)' })
    @IsString()
    variantValue: string;
  
    @ApiProperty({ description: 'Quantity' })
    @IsInt()
    @IsPositive()
    quantity: number;
  }
  