import { forwardRef, Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity, CourseEntity } from 'src/entities/courses';
import { KeyTokenEntity } from 'src/entities/auth';
import { RedisService } from 'src/common/redis/redis.service';
import { CategoryModule } from '../category/category.module';

@Module({
   imports: [
      TypeOrmModule.forFeature([CourseEntity, KeyTokenEntity, CategoryEntity]),
      forwardRef(() => CategoryModule),
   ],
   controllers: [CourseController],
   providers: [CourseService, RedisService],
   exports: [CourseService],
})
export class CourseModule {}
