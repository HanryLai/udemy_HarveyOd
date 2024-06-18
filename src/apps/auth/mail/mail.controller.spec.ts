import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { ValidOtp } from './dto/vaild-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';

describe('MailController', () => {
   let controller: MailController;
   let service: MailService;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         controllers: [MailController],
         providers: [
            {
               provide: MailService,
               useValue: {
                  validateOtp: jest.fn().mockResolvedValue(true),
                  sendNewOtp: jest.fn().mockResolvedValue({
                     success: true,
                     message: 'New OTP has been sent',
                     data: null,
                  }),
               },
            },
         ],
      }).compile();

      controller = module.get<MailController>(MailController);
      service = module.get<MailService>(MailService);
   });

   it('should be defined', () => {
      expect(controller).toBeDefined();
   });

   it('should validate OTP', async () => {
      const validOtp: ValidOtp = { email: 'test@test.com', otp: '123456' };
      const result = await controller.validateAccount(validOtp);
      expect(result).toEqual({
         success: result.success,
         message: result ? 'OTP is valid' : 'OTP is invalid',
         data: {},
      });
      expect(service.validateOtp).toHaveBeenCalledWith(validOtp);
   });

   it('should send new OTP', async () => {
      const sendOtpDto: SendOtpDto = { username: 'test', email: 'test@test.com' };
      const result = await controller.getNewOtp(sendOtpDto);
      expect(result).toEqual({
         success: true,
         message: 'New OTP has been sent',
         data: null,
      });
      expect(service.sendNewOtp).toHaveBeenCalledWith(sendOtpDto);
   });
});
