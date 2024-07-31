import { forwardRef, Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity, TagEntity } from 'src/entities/courses';
import { KeyTokenEntity } from 'src/entities/auth';
import { CourseModule } from '../course/course.module';

@Module({
   imports: [
      TypeOrmModule.forFeature([TagEntity, CourseEntity, KeyTokenEntity]),
      forwardRef(() => CourseModule),
   ],
   controllers: [TagController],
   providers: [TagService],
   exports: [TagService],
})
export class TagModule {}
