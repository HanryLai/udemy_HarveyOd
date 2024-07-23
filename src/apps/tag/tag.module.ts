import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity, CourseEntity, TagEntity } from 'src/entities/courses';
import { CourseService } from '../course/course.service';
import { KeyTokenEntity } from 'src/entities/auth';
import { RedisService } from 'src/common/redis/redis.service';
import { CourseModule } from '../course/course.module';

@Module({
   imports: [TypeOrmModule.forFeature([TagEntity, CourseEntity, KeyTokenEntity]), CourseModule],
   controllers: [TagController],
   providers: [TagService],
   exports: [TagService],
})
export class TagModule {}
