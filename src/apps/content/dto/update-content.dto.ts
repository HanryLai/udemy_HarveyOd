import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateContentDto } from './create-content.dto';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateContentDto extends PartialType(CreateContentDto) {
   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   title?: string;

   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   description?: string;

   @ApiProperty()
   @IsString()
   @IsNotEmpty()
   contentData?: string;
}
