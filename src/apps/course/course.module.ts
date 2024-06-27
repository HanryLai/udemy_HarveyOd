import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository, CourseRepository } from 'src/repositories/courses';
import { KeyTokenRepository } from 'src/repositories/auth';
import { CategoryEntity, CourseEntity } from 'src/entities/courses';
import { KeyTokenEntity } from 'src/entities/auth';

@Module({
   imports: [TypeOrmModule.forFeature([CourseEntity, KeyTokenEntity, CategoryEntity])],
   controllers: [CourseController],
   providers: [CourseService],
})
export class CourseModule {}
