import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { MessageResponse, OK } from 'src/common';
import { ValidOtp } from './dto/vaild-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { MailService } from './mail.service';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
   constructor(private readonly mailService: MailService) {}

   @Throttle({ default: { limit: 5, ttl: 60000 } })
   @HttpCode(HttpStatus.OK)
   @Post('valid-otp')
   @ApiOperation({ summary: 'Validate OTP' })
   @ApiOkResponse({ description: 'OTP validation result' })
   @ApiBody({ type: ValidOtp, description: 'OTP to validate' })
   public async validateAccount(@Body() validOtp: ValidOtp): Promise<MessageResponse> {
      const result = await this.mailService.validateOtp(validOtp);
      return new OK({
         message: result ? 'OTP is valid' : 'OTP is invalid',
         metadata: {},
      });
   }
   @Throttle({ default: { limit: 2, ttl: 180000 } })
   @HttpCode(HttpStatus.OK)
   @Post('send-new-otp')
   @ApiOperation({ summary: 'Request to send a new OTP' })
   @ApiOkResponse({ description: 'New OTP has been sent' })
   @ApiBody({ type: SendOtpDto, description: 'Email to send OTP to' })
   public async getNewOtp(@Body() sendOtpDto: SendOtpDto): Promise<MessageResponse> {
      return await this.mailService.sendNewOtp(sendOtpDto);
   }
}
