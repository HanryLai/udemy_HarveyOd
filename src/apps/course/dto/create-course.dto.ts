import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   title: string;

   @ApiProperty()
   @IsOptional()
   @IsString()
   description: string;

   @ApiProperty()
   @IsOptional()
   @IsArray()
   language: string[];

   @ApiProperty()
   @IsOptional()
   @IsNumber({}, { message: 'Price must be a numeric string' })
   price: number;

   @ApiProperty()
   @IsOptional()
   @IsString()
   level: string;

   @ApiProperty()
   @IsOptional()
   discount: number;

   @ApiProperty()
   @IsOptional()
   @IsString()
   thunbnailUrl: string;
}
