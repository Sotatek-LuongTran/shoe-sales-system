import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty({
        description: 'Name of the category',
        example: 'Running shoe'
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'Description of the category',
        example: 'Run run run',
        required: false,
        maxLength: 500
    })
    @IsString()
    @MaxLength(500)
    @IsNotEmpty()
    @IsOptional()
    description?: string;
}