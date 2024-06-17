import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, RegisterDto, LoginDto, ResetPasswordDto } from './dtos';

describe('AuthController', () => {
   let authController: AuthController;
   let authService: AuthService;

   beforeEach(async () => {
      const moduleTest: TestingModule = await Test.createTestingModule({
         controllers: [AuthController],
         providers: [
            {
               provide: AuthService,
               useValue: {
                  register: jest.fn().mockResolvedValue({}),
                  login: jest.fn().mockResolvedValue({}),
                  verifyAccount: jest.fn().mockResolvedValue({}),
                  forgotPassword: jest.fn().mockResolvedValue({}),
                  resetPassword: jest.fn().mockResolvedValue({}),
               },
            },
         ],
      }).compile();
      authController = moduleTest.get<AuthController>(AuthController);
      authService = moduleTest.get<AuthService>(AuthService);
   });

   it('shoule call register method with correct parameters', async () => {
      const registerDto: RegisterDto = {
         username: 'usernametesting',
         password: 'passwordtesting',
         email: 'emailtesting@gmail.com',
      };
      await authController.register(registerDto);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
   });

   it('should call login method with correct parameters', async () => {
      const loginDto: LoginDto = {
         username: 'usernametesting',
         password: 'passwordtesting',
      };

      const mockReq = {}; // Mock request object
      const mockRes = { send: jest.fn() }; // Mock response object

      await authController.login(loginDto, mockRes as any, mockReq as any);
      expect(authService.login).toHaveBeenCalledWith(loginDto, mockReq, mockRes);
      expect(mockRes.send).toHaveBeenCalled();
   });

   it('should call verifyAccount method with correct parameters', async () => {
      const email = 'emailtesting@gmail.com';
      await authController.verifyAccount(email);
      expect(authService.verifyAccount).toHaveBeenCalledWith(email);
   });

   it('should call forgotPassword method with correct parameters', async () => {
      const forgotDto: ForgotPasswordDto = {
         email: 'emailtesting@gmail.com',
         newPassword: 'newpasswordtesting',
         otp: '123456',
      };
      await authController.forgotPassword(forgotDto);
      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotDto);
   });
   it('should reset password', async () => {
      const resetDto: ResetPasswordDto = {
         email: 'test@example.com',
         newPassword: 'newPassword123',
         oldPassword: 'oldPassword123',
      };

      expect(await authController.resetPassword(resetDto));
      expect(authService.resetPassword).toHaveBeenCalledWith(resetDto);
   });
});
