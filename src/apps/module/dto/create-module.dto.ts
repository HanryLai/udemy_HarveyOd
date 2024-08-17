import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateModuleDto {
   @ApiProperty()
   @IsNotEmpty()
   @IsString()
   title: string;

   @ApiProperty()
   @IsString()
   description: string;

   @ApiProperty()
   @IsNotEmpty()
   @IsBoolean()
   isPublished: boolean;
}
