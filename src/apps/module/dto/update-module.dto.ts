import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateModuleDto } from './create-module.dto';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateModuleDto extends PartialType(CreateModuleDto) {
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
