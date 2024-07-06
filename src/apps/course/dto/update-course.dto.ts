import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import {
   IsArray,
   IsEnum,
   IsNotEmpty,
   IsNumber,
   IsOptional,
   IsString,
} from 'class-validator';
import { Level } from '../enum/level.enum';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
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
