import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ErrorResponse, HttpExceptionFilter, MessageResponse, OK } from 'src/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity, CourseModuleEntity } from 'src/entities/courses';
import { CourseModuleRepository } from 'src/repositories/courses';
import { EntityManager } from 'typeorm';
import { CourseService } from '../course/course.service';
import { CourseType } from 'src/constants';
import { AccountEntity } from 'src/entities/accounts';

@Injectable()
export class ModuleService {
   constructor(
      @InjectRepository(CourseModuleEntity) private moduleRepository: CourseModuleRepository,
      private entityManager: EntityManager,

      @Inject(forwardRef(() => CourseService))
      private courseService: CourseService,
   ) {}

   public async findModuleById(id_Module: string): Promise<MessageResponse> {
      try {
         const foundModule = await this.moduleRepository.findOne({
            where: { id: id_Module, course: { type: CourseType.PUBLISH }, isPublished: true },
            relations: ['course'],
            select: [
               'id',
               'title',
               'description',
               'lessons',
               'orderIndex',
               'isActive',
               'course',
               'isPublished',
            ],
         });
         if (!foundModule) {
            return new ErrorResponse({
               message: 'Not found any module',
               statusCode: 404,
            });
         }
         return new OK({
            message: 'Find module by id successfully',
            metadata: foundModule,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error find module by id',
            error: error,
         });
      }
   }

   public async findOwnerModuleById(id_Module: string, token: string): Promise<MessageResponse> {
      try {
         //check account
         let foundAccount = await this.courseService.checkAccount(token);
         if (foundAccount instanceof ErrorResponse) return foundAccount;
         foundAccount = foundAccount as AccountEntity;
         const foundModule = await this.moduleRepository.findOne({
            where: {
               id: id_Module,
               course: {
                  instructor: {
                     id: foundAccount.id,
                  },
               },
            },
            relations: ['course', 'course.instructor'],
            select: [
               'id',
               'title',
               'description',
               'lessons',
               'orderIndex',
               'isActive',
               'course',
               'isPublished',
            ],
         });
         if (!foundModule) {
            return new ErrorResponse({
               message: 'Not found any module',
               statusCode: 404,
            });
         }
         return new OK({
            message: 'Find module by id successfully',
            metadata: foundModule,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error find module by id',
            error: error,
         });
      }
   }

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
         const listModuleOfCourseResponse = await this.courseService.findOwnerModulesOfCourse(
            idCourse,
            token,
         );

         const isValid = this.isValidCreateModule(
            createModuleDto.title,
            listModuleOfCourseResponse,
            createModuleDto.orderIndex,
         );
         console.log(isValid, 'isValid');
         if (isValid instanceof ErrorResponse) return isValid;
         // create new module
         const newModule = new CourseModuleEntity(createModuleDto);
         newModule.course = course.metadata;
         const result = await this.entityManager.save(newModule);
         return new OK({
            message: 'Create new module successfully',
            metadata: result,
         });
      } catch (error) {
         console.log('error', error);
         throw new HttpExceptionFilter({
            message: 'Error create new module of course',
            error: error,
         });
      }
   }

   public async updateModule(
      UpdateModuleDto: UpdateModuleDto,
      idModule: string,
      token: string,
   ): Promise<MessageResponse> {
      try {
         // find module and check permission
         const moduleCourse = await this.findOwnerModuleById(idModule, token);
         console.log('module', moduleCourse);
         if (moduleCourse instanceof ErrorResponse) return moduleCourse;

         let { course, ...module } = moduleCourse.metadata;
         console.log('module', module);
         // update module
         module = { ...module, ...UpdateModuleDto };
         console.log('module', module);

         const result = await this.moduleRepository.save(module);
         return new OK({
            message: 'Update module successfully',
            metadata: result,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error update module',
            error: error,
         });
      }
   }

   public isValidCreateModule(
      title: string,
      courseResponse: MessageResponse,
      orderIndex: number,
   ): boolean | MessageResponse {
      try {
         const course = courseResponse.metadata as CourseEntity;
         const isValid =
            courseResponse.statusCode === 200 || courseResponse.message == 'Not exist any module';
         if (!isValid) return courseResponse;

         if (!course.modules) return true;
         const module = course.modules.find((module) => module.title === title);
         const isDuplicateOrderIndex = this.isDuplicateOrderIndex(orderIndex, course.modules);
         console.log(isDuplicateOrderIndex);
         console.log('module', module);
         if (module) {
            console.log('moduleeeee', module);
            return new ErrorResponse({
               message: 'This title is already exist',
               statusCode: HttpStatus.BAD_REQUEST,
            });
         }
         if (isDuplicateOrderIndex)
            return new ErrorResponse({
               message: 'This order index is already exist',
               statusCode: HttpStatus.BAD_REQUEST,
            });
         return true;
      } catch (error) {
         console.log('error', error);
         throw new HttpExceptionFilter({
            message: 'Error check duplicate title for module',
            error: error,
         });
      }
   }

   public isDuplicateOrderIndex(
      orderIndex: number,
      listModuleOfCourse: CourseModuleEntity[],
   ): boolean | MessageResponse {
      try {
         const module = listModuleOfCourse.find((module) => module.orderIndex === orderIndex);
         return module ? true : false;
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error check duplicate order index for module',
            error: error,
         });
      }
   }
}
