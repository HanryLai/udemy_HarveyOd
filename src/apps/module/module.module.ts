import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModuleEntity } from 'src/entities/courses';
import { CourseModule } from '../course/course.module';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';

@Module({
   imports: [TypeOrmModule.forFeature([CourseModuleEntity]), CourseModule],
   controllers: [ModuleController],
   providers: [ModuleService],
   exports: [ModuleService],
})
export class ModuleModule {}
