import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateBrandDto {
    @ApiProperty({
        description: 'Name of the brand',
        example: 'Adidas'
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'Description of the brand',
        example: 'Sport gears providers',
        required: false,
        maxLength: 500
    })
    @IsString()
    @MaxLength(500)
    @IsNotEmpty()
    @IsOptional()
    description?: string;
}