import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { MailService } from './mail.service';
import { OtpService } from '../otp/otp.service';
import { SendOtpDto } from './dto/send-otp.dto';

describe('MailService', () => {
   let service: MailService;
   let otpService: OtpService;
   let queue: Queue;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            MailService,
            {
               provide: OtpService,
               useValue: { generateAndStoreOtp: jest.fn(), validateOtp: jest.fn() },
            },
            { provide: 'BullQueue_mail', useValue: { add: jest.fn() } },
         ],
      }).compile();

      service = module.get<MailService>(MailService);
      otpService = module.get<OtpService>(OtpService);
      queue = module.get<Queue>('BullQueue_mail');
   });

   it('should be defined', () => {
      expect(service).toBeDefined();
   });

   it('should send OTP email', async () => {
      const result = await service.sendOTPEmail('test', 'test@test.com', '123456');
      expect(result).toBe(true);
      expect(queue.add).toBeCalledWith('sendOTPEmail', {
         name: 'test',
         email: 'test@test.com',
         otp: '123456',
      });
   });

   it('should validate OTP successfully', async () => {
      const validOtp = { email: 'test@test.com', otp: '123456' };
      const response = {
         success: true,
         message: 'OTP is valid',
         data: {},
      };

      jest.spyOn(otpService, 'validateOtp').mockResolvedValue(response);

      const result = await service.validateOtp(validOtp);

      expect(result).toEqual(response);
      expect(otpService.validateOtp).toHaveBeenCalledWith(validOtp.email, validOtp.otp);
   });

   // it('should send new OTP', async () => {
   //    jest.spyOn(otpService, 'generateAndStoreOtp').mockResolvedValueOnce('123456');
   //    jest.spyOn(service, 'sendOTPEmail').mockResolvedValueOnce(true);
   //    const sendOtpDto: SendOtpDto = { username: 'test', email: 'test@test.com' };
   //    const result = await service.sendNewOtp(sendOtpDto);
   //    expect(result).toEqual({
         
   //    });
   //    expect(otpService.generateAndStoreOtp).toBeCalledWith('test@test.com');
   //    expect(service.sendOTPEmail).toBeCalledWith('test', 'test@test.com', '123456');
   // });
});
