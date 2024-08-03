import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateModuleDto {
   @ApiProperty()
   @IsNotEmpty()
   @IsString()
   title: string;

   @ApiProperty()
   @IsString()
   description: string;

   @ApiProperty()
   @IsNumber()
   @IsNotEmpty()
   orderIndex: number;

   @ApiProperty()
   @IsNotEmpty()
   @IsBoolean()
   isPublished: boolean;
}
