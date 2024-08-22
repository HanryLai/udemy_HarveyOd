import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisService } from 'src/common/redis/redis.service';
import { KeyTokenEntity } from 'src/entities/auth';
import { CourseEntity } from 'src/entities/courses';
import { CategoryModule } from '../category/category.module';
import { TagModule } from '../tag/tag.module';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseRepository } from 'src/repositories/courses';

@Module({
   imports: [
      TypeOrmModule.forFeature([CourseEntity, KeyTokenEntity]),
      forwardRef(() => CategoryModule),
      forwardRef(() => TagModule),
   ],
   controllers: [CourseController],
   providers: [CourseService, RedisService, CourseRepository],
   exports: [CourseService],
})
export class CourseModule {}
