import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class TagsCourseDto {
   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   courseId: string;

   @ApiProperty()
   @IsArray()
   tagIds: string[];
}
