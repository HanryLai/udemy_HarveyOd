import { forwardRef, Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity, CourseEntity } from 'src/entities/courses';
import { CourseService } from '../course/course.service';
import { KeyTokenEntity } from 'src/entities/auth';
import { RedisService } from 'src/common/redis/redis.service';
import { CourseModule } from '../course/course.module';

@Module({
   imports: [
      TypeOrmModule.forFeature([CategoryEntity, CourseEntity, KeyTokenEntity]),
      forwardRef(() => CourseModule),
   ],
   controllers: [CategoryController],
   providers: [CategoryService, RedisService],
   exports: [CategoryService],
})
export class CategoryModule {}
