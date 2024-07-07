import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CategoryCourseDto {
   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   courseId: string;

   @ApiProperty()
   @IsArray()
   @IsNotEmpty()
   categoryIds: string[];
}
