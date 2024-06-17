import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import { EntityManager } from 'typeorm';

import checkUsername from 'src/utils/check-username.util';
import { CustomException } from 'src/common';
import { MessageResponse } from 'src/common/responses';
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
   ) {
   }

   public async register(registerDto: RegisterDto): Promise<MessageResponse> {
      !await validateUsername(registerDto.username);
      return await this.createAccount(registerDto);
   }

   public async verifyAccount(email: string): Promise<MessageResponse> {
      const account = await this.findAccountByEmail(email);
      if (!account) {
         return {
            success: false,
            message: 'Account not found',
            data: {},
         };
      }
      if (account.isVerified) {
         return {
            success: false,
            message: 'Account already verified',
            data: {},
         };
      }
      account.isVerified = true;
      const updateAccount = await this.accountRepository.save(account);
      return {
         success: true,
         message: 'Account verified successfully',
         data: updateAccount,
      };
   }

   public async login(loginDto: LoginDto, req: Request, res: Response): Promise<MessageResponse> {
      try {
         // validate username
         !await validateUsername(loginDto.username);

         // check username is mail or not
         const checkUsernameResult = checkUsername(loginDto.username);

         // Choose the appropriate method based on checkUsernameResult
         const findAccountMethod = checkUsernameResult
            ? this.findAccountByEmail
            : this.findAccountByUsername;

         const foundAccount = await findAccountMethod.call(this, loginDto.username);
         if (!foundAccount) {
            return {
               success: false,
               message: 'Account not found',
               data: {},
            };
         }
         return await this.transactionLoginAccount(loginDto, foundAccount, req, res);
      } catch (err) {
         throw new CustomException('', HttpStatus.OK, err);
      }
   }

   public async forgotPassword(forgotDto: ForgotPasswordDto): Promise<MessageResponse> {
      try {
         const { email, newPassword, otp } = forgotDto;
         // check username is mail or not
         const account = await this.findAccountByEmail(email);
         if (!account) {
            return {
               success: false,
               message: 'Account not found',
               data: {},
            };
         }

         // check password
         if (bcrypt.compareSync(newPassword, account.password)) {
            return {
               success: false,
               message: 'New password is same as old password',
               data: {},
            };
         }
         // check otp
         if (!(await this.otpService.validateOtp(email, otp))) {
            return {
               success: false,
               message: 'Invalid OTP',
               data: {},
            };
         }
         // update password
         account.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
         await this.entityManager.save(account);
         // delete otp
         await this.otpService.deleteOtp(email);

         return {
            success: true,
            message: 'Forgot password success',
            data: {},
         };
      } catch (error) {
         throw new CustomException(
            'Forgot pass Account Fail',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
      }
   }

   public async resetPassword(resetDto: ResetPasswordDto): Promise<MessageResponse> {
      try {
         const { email, oldPassword, newPassword } = resetDto;
         // check username is mail or not
         const account = await this.findAccountByEmail(email);
         if (!account) {
            return {
               success: false,
               message: 'Account not found',
               data: {},
            };
         }

         // check password
         if (!bcrypt.compareSync(oldPassword, account.password)) {
            return {
               success: false,
               message: 'Password is incorrect',
               data: {},
            };
         }

         // update password
         const updatePassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
         await this.accountRepository.update(account.id, { password: updatePassword });

         return {
            success: true,
            message: 'Reset password success',
            data: {},
         };
      } catch (error) {
         throw new CustomException(
            'Reset pass Account Fail',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
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
            return {
               success: false,
               message: 'Password is incorrect',
               data: {},
            };
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

         return {
            success: true,
            message: 'Login success',
            data: {
               username: account.username,
               email: account.email,
               isVerified: account.isVerified,
            },
         };
      } catch (error) {
         throw new CustomException(
            'Transaction Login Internal',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
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
         throw new CustomException(
            'Find account by username fail',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
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
         throw new CustomException('Find By Emal Fail', HttpStatus.INTERNAL_SERVER_ERROR, error);
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
            return {
               success: false,
               message: 'Account already exists',
               data: {},
            };
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
         return {
            success: true,
            data: saveAccount,
            message: 'User registered successfully',
         };
      } catch (error) {
         throw new CustomException(
            'Account creation failed',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
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
