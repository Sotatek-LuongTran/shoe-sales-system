import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class UpdateCategoryDto {

    @ApiProperty({
        description: 'Id of the brand'
    })
    @IsUUID()
    id: string

    @ApiProperty({
        description: 'Name of the brand',
        example: 'Adidas 2'
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(100)
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Description of the brand',
        example: 'Sport gears providers 2',
        required: false,
        maxLength: 500
    })
    @IsString()
    @MaxLength(500)
    @IsNotEmpty()
    @IsOptional()
    description?: string;
}