import { forwardRef, Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseContentEntity } from 'src/entities/courses';
import { CourseModule } from '../course/course.module';

@Module({
   imports: [TypeOrmModule.forFeature([CourseContentEntity]), forwardRef(() => CourseModule)],
   controllers: [ContentController],
   providers: [ContentService],
   exports: [ContentService],
})
export class ContentModule {}
