import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountEntity } from 'src/entities/accounts';
import { MailModule } from './mail/mail.module';
import { KeytokenModule } from './keytoken/keytoken.module';
import { OtpModule } from './otp/otp.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
   imports: [TypeOrmModule.forFeature([AccountEntity]), MailModule, KeytokenModule, OtpModule, SessionsModule],
   providers: [AuthService],
   controllers: [AuthController],
})
export class AuthModule {}
