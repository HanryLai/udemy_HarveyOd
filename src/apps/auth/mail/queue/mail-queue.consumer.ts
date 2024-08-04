import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
@Processor('mail')
export class MailQueueConsumer {
   constructor(private readonly mailSerivce: MailerService) {}
   @Process('sendOTPEmail')
   async sendOTPEmail(job: Job<{ name: string; email: string; otp: string }>) {
      const { name, email, otp } = job.data;

      await this.mailSerivce.sendMail({
         to: email,
         from: 'noreply@example.com',
         subject: 'OTP Verification - HarveyOD',
         text: `Your OTP is ${otp}`,
         html: `
        <p>Dear ${name},</p>
        <p>Your OTP for account verification is: <b>${otp}</b></p>
        <p>This OTP is valid for 5 minutes. If you did not request this OTP, please ignore this email.</p>
        <p>Best Regards,</p>
        <p>HarveyOD Team</p>
      `,
      });
   }
}
