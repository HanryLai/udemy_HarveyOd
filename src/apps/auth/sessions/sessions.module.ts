import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from 'src/entities/auth';

@Module({
   imports: [TypeOrmModule.forFeature([SessionEntity])],
   controllers: [SessionsController],
   providers: [SessionsService],
   exports: [SessionsService],
})
export class SessionsModule {}
