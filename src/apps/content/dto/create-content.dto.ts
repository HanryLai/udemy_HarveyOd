import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

   @ApiProperty()
   @IsNumber()
   @IsNotEmpty()
   orderIndex: number;
}
