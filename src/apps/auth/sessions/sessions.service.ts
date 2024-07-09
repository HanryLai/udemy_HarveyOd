import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { SessionEntity } from 'src/entities/auth';
import { SessionRepository } from 'src/repositories/auth';
@Injectable()
export class SessionsService {
   constructor(
      @InjectRepository(SessionEntity) private readonly sessionRepository: SessionRepository,
   ) {}
}
