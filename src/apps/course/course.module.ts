import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity, CourseEntity } from 'src/entities/courses';
import { KeyTokenEntity } from 'src/entities/auth';

@Module({
   imports: [TypeOrmModule.forFeature([CourseEntity, KeyTokenEntity, CategoryEntity])],
   controllers: [CourseController],
   providers: [CourseService],
})
export class CourseModule {}
