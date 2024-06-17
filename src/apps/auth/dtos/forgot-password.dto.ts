import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ForgotPasswordDto {
   @ApiProperty({ description: 'User email' })
   @IsString()
   email: string;

   @ApiProperty()
   @IsString()
   newPassword: string;

   @ApiProperty()
   @IsString()
   otp: string;
}
