import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import { MAIL_QUEUE, SEND_OTP_EMAIL_JOB } from 'src/constants';
import { MessageResponse } from 'src/common';
import { ValidOtp } from './dto/vaild-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { OtpService } from '../otp/otp.service';

@Injectable()
export class MailService {
   constructor(
      @InjectQueue(MAIL_QUEUE) private mailQueue: Queue,
      private readonly otpService: OtpService,
   ) {
   }

   public async sendOTPEmail(name: string, email: string, otp: string): Promise<boolean> {
      await this.mailQueue.add(SEND_OTP_EMAIL_JOB, { name, email, otp });
      return true;
   }

   public validateOtp(validOtp: ValidOtp): Promise<MessageResponse> {
      return  this.otpService.validateOtp(validOtp.email, validOtp.otp);
   }

   public async sendNewOtp(sendMailDto: SendOtpDto): Promise<MessageResponse> {
      const otp = await this.otpService.generateAndStoreOtp(sendMailDto.email);
      await this.sendOTPEmail(sendMailDto.username, sendMailDto.email, otp);

      return {
         success: true,
         message: 'New OTP has been sent',
         data: {
            email: sendMailDto.email,
            otp,
         },
      };
   }
}
