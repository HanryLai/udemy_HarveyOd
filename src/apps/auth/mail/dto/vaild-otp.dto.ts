import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ValidOtp {
   @ApiProperty()
   @IsNotEmpty()
   email: string;

   @ApiProperty()
   @IsNotEmpty()
   otp: string;
}
