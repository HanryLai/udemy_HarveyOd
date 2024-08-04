import { forwardRef, Module } from '@nestjs/common';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModuleEntity } from 'src/entities/courses';
import { CourseModule } from '../course/course.module';

@Module({
   imports: [TypeOrmModule.forFeature([CourseModuleEntity]), forwardRef(() => CourseModule)],
   controllers: [ModuleController],
   providers: [ModuleService],
   exports: [ModuleService],
})
export class ModuleModule {}
