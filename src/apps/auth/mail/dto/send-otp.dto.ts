import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SendOtpDto {
   @ApiProperty()
   @IsNotEmpty()
   username: string;
   @ApiProperty()
   @IsNotEmpty()
   email: string;
}
