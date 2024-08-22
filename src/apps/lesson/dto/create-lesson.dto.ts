import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CourseLessonEntity } from 'src/entities/courses';

export class CreateLessonDto {
   @IsString()
   @IsNotEmpty()
   title: string;

   @IsString()
   content?: string;

   @IsString()
   videoUrl?: string;

   @IsNumber()
   duration?: number;
}
