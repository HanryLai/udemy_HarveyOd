import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity, CourseEntity } from 'src/entities/courses';
import { CourseService } from '../course/course.service';
import { KeyTokenEntity } from 'src/entities/auth';

@Module({
   imports: [TypeOrmModule.forFeature([CategoryEntity, CourseEntity, KeyTokenEntity])],
   controllers: [CategoryController],
   providers: [CategoryService, CourseService],
})
export class CategoryModule {}
