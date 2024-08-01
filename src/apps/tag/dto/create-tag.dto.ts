import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsNull } from 'typeorm';

export class CreateTagDto {
   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   name: string;

   @ApiProperty()
   @IsString()
   description: string;
}
