import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorResponse, HttpExceptionFilter, MessageResponse, OK } from 'src/common';
import { CourseType } from 'src/constants';
import { AccountEntity } from 'src/entities/accounts';
import { CourseModuleEntity } from 'src/entities/courses';
import { CourseModuleRepository } from 'src/repositories/courses';
import { EntityManager, Not } from 'typeorm';
import { CourseService } from '../course/course.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

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
               metadata: {},
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
               metadata: {},
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

         const moduleDuplicateTitle = await this.moduleRepository.findOne({
            where: {
               title: createModuleDto.title,
               course: { id: idCourse },
            },
         });

         const length = await this.moduleRepository.count({
            where: { course: { id: idCourse } },
         });

         if (moduleDuplicateTitle) {
            return new ErrorResponse({
               message: 'This title is already exist',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         }
         // create new module
         const newModule = new CourseModuleEntity({
            ...createModuleDto,
            orderIndex: length,
         });
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

         if (moduleCourse instanceof ErrorResponse) return moduleCourse;
         //check duplicate title
         const moduleDuplicateTitle = await this.moduleRepository.findOne({
            where: [{ title: UpdateModuleDto.title, id: Not(idModule) }],
            select: ['id'],
         });
         if (moduleDuplicateTitle) {
            return new ErrorResponse({
               message: 'This title is already exist',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         }

         let { course, ...module } = moduleCourse.metadata;
         // update module
         module = { ...module, ...UpdateModuleDto };

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

   public async updateModuleOrderIndex(
      moduleId: string,
      newOrderIndex: number,
      token: string,
   ): Promise<MessageResponse> {
      try {
         // find module and check permission
         const foundModule = await this.findOwnerModuleById(moduleId, token);
         if (foundModule instanceof ErrorResponse) return foundModule;

         const found: CourseModuleEntity = foundModule.metadata;
         const currentIndex = found.orderIndex;
         //check valid order
         if (newOrderIndex < 0) {
            return new ErrorResponse({
               message: 'Order index must be greater than or equal to 0',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         }

         // Check same module
         if (found.orderIndex === newOrderIndex)
            return new ErrorResponse({
               message: 'This module still is this order',
               metadata: {},
               statusCode: HttpStatus.CONFLICT,
            });
         // check valid order
         const length = await this.moduleRepository.count({
            where: { course: { id: found.course.id } },
         });
         if (newOrderIndex >= length) {
            return new ErrorResponse({
               message: 'Order index must be less than ' + length,
               metadata: {},
               statusCode: HttpStatus.BAD_REQUEST,
            });
         }
         // transaction save order index
         const result = await this.entityManager.transaction(async (transactionManager) => {
            const courseId = foundModule.metadata.course.id;

            // push down modules have order index between new order index  and current index
            if (newOrderIndex < currentIndex) {
               await transactionManager
                  .createQueryBuilder()
                  .update(CourseModuleEntity)
                  .set({ orderIndex: () => '"module_index" + 1' })
                  .where('"module_index" >= :newOrderIndex AND "module_index" < :currentIndex', {
                     newOrderIndex,
                     currentIndex,
                  })
                  .andWhere('courseId = :courseId', { courseId })
                  .execute();
            }

            if (newOrderIndex > currentIndex) {
               await transactionManager
                  .createQueryBuilder()
                  .update(CourseModuleEntity)
                  .set({ orderIndex: () => '"module_index" - 1' })
                  .where('"module_index" <= :newOrderIndex AND "module_index" > :currentIndex', {
                     newOrderIndex,
                     currentIndex,
                  })
                  .andWhere('courseId = :courseId', { courseId })
                  .execute();
            }

            // Update order index of module
            return await transactionManager
               .createQueryBuilder()
               .update(CourseModuleEntity)
               .set({ orderIndex: newOrderIndex })
               .where('id = :moduleId', { moduleId })
               .execute();
         });
         if (result instanceof ErrorResponse) return result;
         return new OK({
            message: 'Update order index of module successfully',
            metadata: result,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error update order index of module',
            error: error,
         });
      }
   }
}
