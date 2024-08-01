import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisService } from 'src/common/redis/redis.service';
import { KeyTokenEntity } from 'src/entities/auth';
import { CategoryEntity, CourseEntity } from 'src/entities/courses';
import { CategoryModule } from '../category/category.module';
import { TagModule } from '../tag/tag.module';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';

@Module({
   imports: [
      TypeOrmModule.forFeature([CourseEntity, KeyTokenEntity, CategoryEntity]),
      forwardRef(() => CategoryModule),
      forwardRef(() => TagModule),
   ],
   controllers: [CourseController],
   providers: [CourseService, RedisService],
   exports: [CourseService],
})
export class CourseModule {}
