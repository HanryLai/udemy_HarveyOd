import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentEntity } from 'src/entities/courses';

@Module({
   imports: [TypeOrmModule.forFeature([EnrollmentEntity])],
   controllers: [EnrollmentController],
   providers: [EnrollmentService],
   exports: [EnrollmentService],
})
export class EnrollmentModule {}
