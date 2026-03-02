import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from "class-validator";
import { PaginateDto } from "src/shared/dto/paginate.dto";
import { VariantStatusEnum } from "src/shared/enums/product-variant";

export class PaginateVariantsDto extends PaginateDto {
  @ApiPropertyOptional({
    description: 'Value of the variant',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @IsOptional()
  variantValue?: string;

  @ApiPropertyOptional({
    description: 'Price of the variant',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Stock of the variant',
  })
  @IsNumber()
  @IsPositive()
  @IsInt()
  @IsOptional()
  stock?: number;
}
