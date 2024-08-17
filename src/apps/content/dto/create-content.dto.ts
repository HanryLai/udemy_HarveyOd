import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContentDto {
   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   title: string;

   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   description: string;

   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   contentData: string;
}
