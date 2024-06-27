import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Level } from '../enum/level.enum';

export class CreateCourseDto {
   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   title: string;

   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   description: string;

   @ApiProperty()
   @IsArray()
   @IsNotEmpty()
   language: string[];

   @ApiProperty()
   @IsNumber({}, { message: 'Price must be a numeric string' })
   price: number;

   @ApiProperty()
   @IsEnum(Level)
   @IsNotEmpty()
   level: Level;

   @ApiProperty()
   discount: number;

   @ApiProperty()
   @IsNotEmpty()
   categoryID: [string];

   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   thunbnailUrl: string;
}
