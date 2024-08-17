import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CreateModuleDto } from './create-module.dto';

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
}
