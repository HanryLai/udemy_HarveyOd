import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseLessonEntity } from 'src/entities/courses';
import { CourseModule } from '../course/course.module';

@Module({
   imports: [TypeOrmModule.forFeature([CourseLessonEntity]), CourseModule],
   controllers: [LessonController],
   providers: [LessonService],
})
export class LessonModule {}
