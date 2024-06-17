import { Test } from '@nestjs/testing';
import { Job } from 'bull';
import { MailQueueConsumer } from './mail-queue.consumer';
import { MailerService } from '@nestjs-modules/mailer';

describe('MailQueueConsumer', () => {
   let mailQueueConsumer: MailQueueConsumer;
   let mailerService: MailerService;

   beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
         providers: [
            MailQueueConsumer,
            {
               provide: MailerService,
               useValue: {
                  sendMail: jest.fn(),
               },
            },
         ],
      }).compile();

      mailQueueConsumer = moduleRef.get<MailQueueConsumer>(MailQueueConsumer);
      mailerService = moduleRef.get<MailerService>(MailerService);
   });

   it('should send OTP email', async () => {
      const job: Job<{ name: string; email: string; otp: string }> = {
         data: {
            name: 'Test User',
            email: 'test@example.com',
            otp: '123456',
         },
      } as Job<{ name: string; email: string; otp: string }>;

      await mailQueueConsumer.sendOTPEmail(job);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
         to: job.data.email,
         from: 'noreply@example.com',
         subject: 'OTP Verification - HarveyOD',
         text: `Your OTP is ${job.data.otp}`,
         html: `
        <p>Dear ${job.data.name},</p>
        <p>Your OTP for account verification is: <b>${job.data.otp}</b></p>
        <p>This OTP is valid for 5 minutes. If you did not request this OTP, please ignore this email.</p>
        <p>Best Regards,</p>
        <p>HarveyOD Team</p>
      `,
      });
   });
});
