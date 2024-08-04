import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ErrorResponse, HttpExceptionFilter, MessageResponse, OK } from 'src/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity, CourseModuleEntity } from 'src/entities/courses';
import { CourseModuleRepository } from 'src/repositories/courses';
import { EntityManager } from 'typeorm';
import { CourseService } from '../course/course.service';

@Injectable()
export class ModuleService {
   constructor(
      @InjectRepository(CourseModuleEntity) private moduleRepository: CourseModuleRepository,
      private entityManager: EntityManager,

      @Inject(forwardRef(() => CourseService))
      private courseService: CourseService,
   ) {}

   public async create(
      createModuleDto: CreateModuleDto,
      idCourse: string,
      token: string,
   ): Promise<MessageResponse> {
      try {
         // find course and check permission
         const course = await this.courseService.findOwnerCourseById(idCourse, token);
         if (course instanceof ErrorResponse) return course;

         // find list module of course
         const listModuleOfCourseResponse = await this.courseService.findModuleOfCourse(idCourse);

         const isValid = this.isValidCreateModule(
            createModuleDto.title,
            listModuleOfCourseResponse,
         );
         if (!isValid || isValid instanceof ErrorResponse) {
            return new ErrorResponse({
               message: 'This title is already exist',
               statusCode: 400,
            });
         }
         // create new module
         const newModule = new CourseModuleEntity(createModuleDto);
         newModule.course = course.metadata;
         const result = await this.entityManager.save(newModule);
         return new OK({
            message: 'Create new module successfully',
            metadata: result,
         });
      } catch (error) {
         console.log(error);
         throw new HttpExceptionFilter({
            message: 'Error create new module of course',
            error: error,
         });
      }
   }

   public isValidCreateModule(
      title: string,
      courseResponse: MessageResponse,
   ): boolean | MessageResponse {
      try {
         const course = courseResponse.metadata as CourseEntity;

         const isValid =
            courseResponse.statusCode === 200 || courseResponse.message == 'Not exist any module';

         if (!isValid) return courseResponse;

         if (Object.keys(course).length === 0) return true;
         const module = course.modules.find((module) => module.title === title);
         console.log(module);
         console.log(module);
         return module ? false : true;
      } catch (error) {
         console.log(error);
         throw new HttpExceptionFilter({
            message: 'Error check duplicate title for module',
            error: error,
         });
      }
   }
}
