import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CategoryCourseDto {
   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   courseId: string;

   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   categoryId: string;
}
