import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateLessonDto {
   @IsString()
   @IsNotEmpty()
   title: string;

   @IsString()
   content?: string;

   @IsString()
   videoUrl?: string;

   @IsNumber()
   duration?: string;
}
