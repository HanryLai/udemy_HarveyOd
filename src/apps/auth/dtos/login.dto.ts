import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
   @ApiProperty()
   @IsNotEmpty()
   @IsString()
   username: string;

   @ApiProperty()
   @IsNotEmpty()
   password: string;

   @ApiProperty()
   refreshToken?: string;
}
