import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyTokenEntity } from 'src/entities/auth';
import { CourseEntity, TagEntity } from 'src/entities/courses';
import { CourseModule } from '../course/course.module';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

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
