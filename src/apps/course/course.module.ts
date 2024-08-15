import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisService } from 'src/common/redis/redis.service';
import { KeyTokenEntity } from 'src/entities/auth';
import { CategoryEntity, CourseEntity } from 'src/entities/courses';
import { CategoryModule } from '../category/category.module';
import { TagModule } from '../tag/tag.module';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { ModuleModule } from '../module/module.module';
import { ContentModule } from '../content/content.module';

@Module({
   imports: [
      TypeOrmModule.forFeature([CourseEntity, KeyTokenEntity]),
      forwardRef(() => CategoryModule),
      forwardRef(() => TagModule),
      forwardRef(() => ModuleModule),
      forwardRef(() => ContentModule),
   ],
   controllers: [CourseController],
   providers: [CourseService, RedisService],
   exports: [CourseService],
})
export class CourseModule {}
