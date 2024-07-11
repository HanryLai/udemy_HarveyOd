import { Body, Controller, Post, Put, Req, Res } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { MessageResponse } from 'src/common';
import { AuthService } from './auth.service';
import { RegisterDto, ResetPasswordDto, LoginDto, ForgotPasswordDto } from './dtos';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Throttle({ default: { limit: 5, ttl: 60000 } })
   @Post('register')
   @ApiOperation({ summary: 'Register a new user' })
   @ApiOkResponse({ description: 'Registration was successful' })
   @ApiBody({ type: RegisterDto, description: 'User registration details' })
   public async register(@Body() registerDto: RegisterDto): Promise<MessageResponse> {
      return await this.authService.register(registerDto);
   }

   @Throttle({ default: { limit: 5, ttl: 60000 } })
   @Post('login')
   @ApiOperation({ summary: 'Log in a user' })
   @ApiOkResponse({ description: 'Login was successful' })
   @ApiBody({ type: LoginDto, description: 'User login details' })
   public async login(
      @Body() loginDto: LoginDto,
      @Res() res: Response,
      @Req() req: Request,
   ): Promise<unknown> {
      const result = await this.authService.login(loginDto, req, res);
      return res.send(result);
   }

   @Put('verify-account')
   @ApiOperation({ summary: 'Verify account' })
   @ApiOkResponse({ description: 'Account verification was successful' })
   @ApiBody({ type: String, description: 'User email' })
   public async verifyAccount(@Body('email') email: string): Promise<MessageResponse> {
      return await this.authService.verifyAccount(email);
   }

   @Throttle({ default: { limit: 1, ttl: 60000 } })
   @Post('forgot-password')
   @ApiOperation({ summary: 'Forgot password' })
   @ApiOkResponse({ description: 'Forgot password was successful' })
   @ApiBody({ type: String, description: 'User email' })
   public async forgotPassword(@Body() forgotDto: ForgotPasswordDto): Promise<MessageResponse> {
      return await this.authService.forgotPassword(forgotDto);
   }

   @Throttle({ default: { limit: 1, ttl: 60000 } })
   @Put('reset-password')
   @ApiOperation({ summary: 'Reset password' })
   @ApiOkResponse({ description: 'Reset password was successful' })
   @ApiBody({ type: ResetPasswordDto, description: 'User email, new password and otp' })
   public async resetPassword(@Body() resetDto: ResetPasswordDto): Promise<MessageResponse> {
      return await this.authService.resetPassword(resetDto);
   }
}
