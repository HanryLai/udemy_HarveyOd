import { Injectable } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { HttpExceptionFilter, MessageResponse, OK } from 'src/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseModuleEntity } from 'src/entities/courses';
import { CourseModuleRepository } from 'src/repositories/courses';
import { EntityManager } from 'typeorm';

@Injectable()
export class ModuleService {
   constructor(
      @InjectRepository(CourseModuleEntity) private moduleRepository: CourseModuleRepository,
      private entityManager: EntityManager,
   ) {}

   public async create(
      createModuleDto: CreateModuleDto,
      idCourse: string,
   ): Promise<MessageResponse> {
      try {
         return new OK({
            message: '',
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error create new module of course',
            error: error,
         });
      }
   }

   public async isDuplicateTitle(title: string): Promise<boolean> {
      try {
         // const foundModule = await this.
         return false;
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error check duplicate title for module',
            error: error,
         });
      }
   }
}
