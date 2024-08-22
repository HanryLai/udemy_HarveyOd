import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorResponse, HttpExceptionFilter, MessageResponse, OK } from 'src/common';
import { EnrollmentEntity } from 'src/entities/courses';
import { EnrollmentRepository } from 'src/repositories/courses';

@Injectable()
export class EnrollmentService {
   constructor(
      @InjectRepository(EnrollmentEntity) private readonly enrollRepo: EnrollmentRepository,
   ) {}

   public async findEnrollById(id: string): Promise<MessageResponse> {
      try {
         const foundEnroll = await this.enrollRepo.findOne({
            where: { id },
         });
         if (!foundEnroll)
            return new ErrorResponse({
               message: 'Not found this enroll',
            });
         return new OK({
            message: 'Found this enroll successfully',
            metadata: foundEnroll,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Find enroll by id error',
            error: error,
         });
      }
   }
}
