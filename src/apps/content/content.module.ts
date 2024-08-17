import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseContentEntity } from 'src/entities/courses';
import { CourseModule } from '../course/course.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
   imports: [TypeOrmModule.forFeature([CourseContentEntity]), CourseModule],
   controllers: [ContentController],
   providers: [ContentService],
   exports: [ContentService],
})
export class ContentModule {}
