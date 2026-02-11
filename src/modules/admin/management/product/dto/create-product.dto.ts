import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { GenderEnum, ProductTypeEnum } from "src/shared/enums/product.enum";

export class CreateProductDto {
    @ApiProperty({
        description: 'Name of the product',
        example: 'A very useful thing'
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'Description of the product',
        example: 'A thing that is very useful as its name',
        required: false,
        maxLength: 500
    })
    @IsString()
    @MaxLength(500)
    @IsNotEmpty()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Type of the product',
        enum: ProductTypeEnum,
        example: ProductTypeEnum.SHOE
    })
    @IsEnum(ProductTypeEnum)
    productType: ProductTypeEnum;

    @ApiProperty({
        description: 'The suitable gender for the product',
        enum: GenderEnum,
        example: GenderEnum.UNISEX
    })
    @IsEnum(GenderEnum)
    gender: GenderEnum;
    
    @ApiProperty({
        description: 'Brand of the product',
    })
    @IsUUID()
    brandId: string;

    @ApiProperty({
        description: 'Category of the product',
    })
    @IsUUID()
    categoryId: string;
}