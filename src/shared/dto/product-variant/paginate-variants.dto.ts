import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from "class-validator";
import { PaginateDto } from "src/shared/dto/paginate.dto";
import { VariantStatusEnum } from "src/shared/enums/product-variant";

export class PaginateVariantsDto extends PaginateDto {
  @ApiProperty({
    description: 'Value of the variant',
    example: 'Blue',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @IsOptional()
  variantValue?: string;

  @ApiProperty({
    description: 'Price of the variant',
    example: '100',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Stock of the variant',
    example: '10',
  })
  @IsNumber()
  @IsPositive()
  @IsInt()
  @IsOptional()
  stock?: number;
}
