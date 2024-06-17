import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResetPasswordDto {
   @ApiProperty({ description: 'User email' })
   @IsString()
   email: string;

   @ApiProperty({ description: 'Old password' })
   @IsString()
   oldPassword: string;

   @ApiProperty({ description: 'New password' })
   @IsString()
   newPassword: string;
}
