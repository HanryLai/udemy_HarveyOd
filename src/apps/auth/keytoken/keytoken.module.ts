import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KeytokenService } from './keytoken.service';
import { KeyTokenEntity } from 'src/entities/auth';

@Module({
   imports: [
      TypeOrmModule.forFeature([KeyTokenEntity]),
      JwtModule.registerAsync({
         useFactory: async () => ({
            secret: process.env.JWT_SECRET,
         }),
      }),
   ],
   providers: [KeytokenService],
   exports: [KeytokenService],
})
export class KeytokenModule {}
