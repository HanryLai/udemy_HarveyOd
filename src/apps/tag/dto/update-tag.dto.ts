import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTagDto } from './create-tag.dto';
import { IsString } from 'class-validator';

export class UpdateTagDto extends PartialType(CreateTagDto) {
   @ApiProperty()
   @IsString()
   name?: string;

   @ApiProperty()
   @IsString()
   description?: string;
}
