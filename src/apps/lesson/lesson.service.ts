import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity, CourseLessonEntity, CourseModuleEntity } from 'src/entities/courses';
import { CourseModuleRepository, LessonRepository } from 'src/repositories/courses';
import { EntityManager, In } from 'typeorm';
import { CourseService } from '../course/course.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CREATED, ErrorResponse, HttpExceptionFilter, MessageResponse, OK } from 'src/common';
import { ModuleService } from '../module/module.service';
import { CourseType } from 'src/constants';
import { AccountEntity } from 'src/entities/accounts';

@Injectable()
export class LessonService {
   constructor(
      @InjectRepository(CourseLessonEntity) private readonly lessonRepo: LessonRepository,
      @Inject() private readonly CourseService: CourseService,
      @Inject() private readonly moduleService: ModuleService,
      private readonly entityManager: EntityManager,
   ) {}

   public async findById(id: string): Promise<MessageResponse> {
      try {
         const foundLesson = await this.lessonRepo
            .createQueryBuilder('lesson')
            .leftJoinAndSelect('lesson.module', 'module')
            .leftJoinAndSelect('module.course', 'course')
            .select([
               'lesson.title',
               'lesson.content',
               'lesson.videoUrl',
               'lesson.duration',
               'lesson.orderIndex',
            ])
            .where('lesson.id = :id', { id: id })
            .andWhere('course.type IN (:...typeCourse)', {
               typeCourse: [CourseType.PUBLISH, CourseType.UPCOMING],
            })
            .getOne();
         console.log(foundLesson);
         if (!foundLesson)
            return new ErrorResponse({
               message: 'Not found this lesson',
               metadata: {},
               statusCode: 404,
            });
         return new OK({
            message: 'found this lesson successfully',
            metadata: foundLesson,
         });
      } catch (error) {
         console.log(error);
         throw new HttpExceptionFilter({
            message: 'Find lesson by id have error',
            error: error,
         });
      }
   }

   public async ownerFindById(id: string, token: string): Promise<MessageResponse> {
      try {
         let account = await this.CourseService.checkAccount(token);
         if (account instanceof ErrorResponse) return account;
         account = account as AccountEntity;
         console.log(account);
         const foundLesson = await this.lessonRepo
            .createQueryBuilder('lesson')
            .leftJoinAndSelect('lesson.module', 'module')
            .leftJoinAndSelect('module.course', 'course')
            .leftJoinAndSelect('course.instructor', 'instructor')
            .select([
               'lesson.title',
               'lesson.content',
               'lesson.videoUrl',
               'lesson.duration',
               'lesson.orderIndex',
            ])
            .where('instructor.id = :id', { id: account.id })
            .andWhere('lesson.id = :id', { id: id })
            .getOne();
         console.log(foundLesson);
         if (!foundLesson)
            return new ErrorResponse({
               message: 'Not found this lesson',
               metadata: {},
               statusCode: 404,
            });
         return new OK({
            message: 'found this lesson successfully',
            metadata: foundLesson,
         });
      } catch (error) {
         console.log(error);
         throw new HttpExceptionFilter({
            message: 'Find lesson by id have error',
            error: error,
         });
      }
   }

   public async create(
      id_module: string,
      createLessonDto: CreateLessonDto,
      token: string,
   ): Promise<MessageResponse> {
      try {
         const foundModuleResponse = await this.moduleService.findOwnerModuleById(id_module, token);
         if (foundModuleResponse instanceof ErrorResponse) return foundModuleResponse;

         const foundModule = foundModuleResponse.metadata as CourseModuleEntity;

         const duplicateTitleLesson = await this.lessonRepo.findOne({
            where: {
               module: {
                  id: id_module,
                  lessons: {
                     title: createLessonDto.title,
                  },
               },
            },
         });
         if (duplicateTitleLesson)
            return new ErrorResponse({
               message: 'Duplicate title lesson on this module',
               statusCode: 409,
               metadata: {},
            });
         const quantityLessonOfModule = await this.lessonRepo.count({
            where: {
               module: {
                  id: id_module,
               },
            },
         });
         const entityLesson = await this.lessonRepo.save({
            ...createLessonDto,
            module: foundModule,
            orderIndex: quantityLessonOfModule,
         });
         if (!entityLesson)
            return new ErrorResponse({
               message: 'Create lesson in save entity error',
               metadata: {},
               statusCode: 400,
            });
         return new CREATED({
            message: 'Create new lesson of module successfully',
            metadata: entityLesson,
         });
      } catch (error) {
         console.log(error);
         throw new HttpExceptionFilter({
            message: 'Create lesson have error',
            error: error,
         });
      }
   }
}
