import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateTagDto } from './create-tag.dto';

export class UpdateTagDto extends PartialType(CreateTagDto) {
   @ApiProperty()
   @IsString()
   name?: string;

   @ApiProperty()
   @IsString()
   description?: string;
}
