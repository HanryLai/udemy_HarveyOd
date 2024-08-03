import { Module } from '@nestjs/common';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModuleEntity } from 'src/entities/courses';

@Module({
   imports: [TypeOrmModule.forFeature([CourseModuleEntity])],
   controllers: [ModuleController],
   providers: [ModuleService],
})
export class ModuleModule {}
