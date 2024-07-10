import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import { EntityManager } from 'typeorm';

import checkUsername from 'src/utils/check-username.util';
import { ErrorResponse, HttpExceptionFilter } from 'src/common';
import { MessageResponse, OK } from 'src/common/responses';
import { ForgotPasswordDto, RegisterDto, ResetPasswordDto } from './dtos';
import { AccountEntity } from 'src/entities/accounts';
import { AccountRepository } from 'src/repositories/accounts';
import { setExpireAt, validateUsername } from 'src/utils';

import { LoginDto } from './dtos';
import { KeytokenService } from './keytoken/keytoken.service';
import { KeyTokenEntity, LoginHistoryEntity, SessionEntity } from 'src/entities/auth';
import { MailService } from './mail/mail.service';
import { OtpService } from './otp/otp.service';

@Injectable()
export class AuthService {
   constructor(
      @InjectRepository(AccountEntity) private readonly accountRepository: AccountRepository,
      private readonly entityManager: EntityManager,
      private readonly keyTokenService: KeytokenService,
      private readonly mailService: MailService,
      private readonly otpService: OtpService,
   ) {}

   public async register(registerDto: RegisterDto): Promise<MessageResponse> {
      !(await validateUsername(registerDto.username));
      return await this.createAccount(registerDto);
   }

   public async verifyAccount(email: string): Promise<MessageResponse> {
      const account = await this.findAccountByEmail(email);
      if (!account) {
         return new ErrorResponse({
            message: 'Account not found',
            statusCode: HttpStatus.NOT_FOUND,
            metadata: {},
         });
      }
      if (account.isVerified) {
         return new ErrorResponse({
            message: 'Account already verified',
            statusCode: HttpStatus.CONFLICT,
            metadata: {},
         });
      }
      account.isVerified = true;
      const updateAccount = await this.accountRepository.save(account);
      return new OK({
         message: 'Account verified',
         metadata: updateAccount,
      });
   }

   public async login(
      loginDto: LoginDto,
      req: Request,
      res: Response,
   ): Promise<MessageResponse | HttpExceptionFilter> {
      try {
         // validate username
         !(await validateUsername(loginDto.username));

         // check username is mail or not
         const checkUsernameResult = checkUsername(loginDto.username);

         // Choose the appropriate method based on checkUsernameResult
         const findAccountMethod = checkUsernameResult
            ? this.findAccountByEmail
            : this.findAccountByUsername;

         const foundAccount = await findAccountMethod.call(this, loginDto.username);

         if (!foundAccount) {
            return new ErrorResponse({
               message: 'Account not found',
               statusCode: HttpStatus.NOT_FOUND,
               metadata: {},
            });
         }

         return await this.transactionLoginAccount(loginDto, foundAccount, req, res);
      } catch (error) {
         return new HttpExceptionFilter({ message: 'login error', error: error });
      }
   }

   public async forgotPassword(forgotDto: ForgotPasswordDto): Promise<MessageResponse> {
      try {
         const { email, newPassword, otp } = forgotDto;
         // check username is mail or not
         const account = await this.findAccountByEmail(email);
         if (!account) {
            return new ErrorResponse({
               message: 'Account not found',
               statusCode: HttpStatus.NOT_FOUND,
               metadata: {},
            });
         }

         // check password
         if (bcrypt.compareSync(newPassword, account.password)) {
            return new ErrorResponse({
               message: 'New password should not be same as old password',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         }
         // check otp
         if (!(await this.otpService.validateOtp(email, otp))) {
            return new ErrorResponse({
               message: 'Invalid OTP',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         }
         // update password
         account.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
         await this.entityManager.save(account);
         // delete otp
         await this.otpService.deleteOtp(email);

         return new OK({
            message: 'Password reset successfully',
            metadata: {},
         });
      } catch (error) {
         throw new HttpExceptionFilter({ message: 'forgot password error', error: error });
      }
   }

   public async resetPassword(resetDto: ResetPasswordDto): Promise<MessageResponse> {
      try {
         const { email, oldPassword, newPassword } = resetDto;
         // check username is mail or not
         const account = await this.findAccountByEmail(email);
         if (!account) {
            return new ErrorResponse({
               message: 'Account not found',
               statusCode: HttpStatus.NOT_FOUND,
               metadata: {},
            });
         }

         // check password
         if (!bcrypt.compareSync(oldPassword, account.password)) {
            return new ErrorResponse({
               message: 'Old password is incorrect',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         }

         // update password
         const updatePassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
         await this.accountRepository.update(account.id, { password: updatePassword });

         return new OK({
            message: 'Password updated successfully',
            metadata: {},
         });
      } catch (error) {
         throw new HttpExceptionFilter({ message: 'reset password error', error: error });
      }
   }

   // --------------------------------------------------------------------------------------------------

   public async transactionLoginAccount(
      loginDto: LoginDto,
      account: AccountEntity,
      req: Request,
      res: Response,
   ): Promise<MessageResponse> {
      try {
         // check password
         const checkPassword = bcrypt.compareSync(loginDto.password, account.password);
         if (!checkPassword) {
            return new ErrorResponse({
               message: 'Password is incorrect',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         }

         // update last login
         const generateKey = await this.keyTokenService.createNewToken({
            id: account.id,
            username: account.username,
         });

         const commonProps = {
            account: account,
            refreshToken: generateKey.refreshToken,
         };

         // create Key Token
         const createKeyToken = new KeyTokenEntity({
            ...commonProps,
            publicKey: generateKey.publicKey,
            privateKey: generateKey.privateKey,
            refreshTokenUsed: [generateKey.refreshToken],
         });

         // create Session
         const createSession = new SessionEntity({
            ...commonProps,
            accessToken: generateKey.accessToken,
            publicKey: generateKey.publicKey,
         });

         // update last login
         const updateLastLogin = new LoginHistoryEntity({
            ...commonProps,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
         });

         // save token
         await this.entityManager.transaction(async (entityManager) => {
            await entityManager.save([createKeyToken, createSession, updateLastLogin, account]);
         });

         // set cookie
         await this.setRefreshTokenCookie(res, generateKey.accessToken);

         return new OK({
            message: 'Login successfully',
            metadata: {
               username: account.username,
               isVerified: account.isVerified,
               accessToken: generateKey.accessToken,
            },
         });
      } catch (error) {
         throw new HttpExceptionFilter({ message: 'transaction login error', error: error });
      }
   }

   private async findAccountByUsername(username: string): Promise<AccountEntity> {
      try {
         return await this.accountRepository.findOne({
            where: { username: username },
            select: {
               id: true,
               username: true,
               password: true,
               email: true,
               isVerified: true,
            },
         });
      } catch (error) {
         throw new HttpExceptionFilter({ message: 'find account by username error', error: error });
      }
   }

   private async findAccountByEmail(email: string): Promise<AccountEntity> {
      try {
         return this.accountRepository.findOne({
            where: { email },
            select: {
               id: true,
               username: true,
               password: true,
               email: true,
               isVerified: true,
            },
         });
      } catch (error) {
         throw new HttpExceptionFilter({ message: 'find account by email error', error: error });
      }
   }

   private async createAccount(registerDto: RegisterDto): Promise<MessageResponse> {
      try {
         // check account exists
         const foundAccount = await this.accountRepository.findOne({
            where: [{ username: registerDto.username }, { email: registerDto.email }],
            // select: { id: true, username: true, password: true, email: true, isVerified: true },
         });
         
         if (foundAccount) {
            return new ErrorResponse({
               message: 'Account already exists',
               statusCode: HttpStatus.CONFLICT,
               metadata: {},
            });
         }

         const salt = bcrypt.genSaltSync(10);
         const hashPw = bcrypt.hashSync(registerDto.password, salt);

         const newAccount = new AccountEntity({
            username: registerDto.username,
            password: hashPw,
            email: registerDto.email,
         });

         const saveAccount = await this.entityManager.save(newAccount);
         // set OTP
         const otp = await this.otpService.generateAndStoreOtp(saveAccount.email);

         // send mail
         await this.mailService.sendOTPEmail(saveAccount.username, saveAccount.email, otp);
         return new OK({
            message: 'Account created successfully',
            metadata: saveAccount,
         });
      } catch (error) {
         throw new HttpExceptionFilter({ message: 'create account error', error: error });
      }
   }

   private async setRefreshTokenCookie(res: Response, refreshToken: string): Promise<void> {
      const expires = setExpireAt(1);
      res.cookie('Authentication', `Bearer ${refreshToken}`, {
         secure: true,
         httpOnly: true,
         expires,
      });
   }
}
