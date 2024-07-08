import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { CategoryRepository, CourseRepository } from 'src/repositories/courses';
import { EntityManager } from 'typeorm';
import { AccountEntity } from 'src/entities/accounts';
import { CustomException, MessageResponse } from 'src/common';
import { CategoryEntity, CourseEntity } from 'src/entities/courses';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyTokenRepository } from 'src/repositories/auth';
import { KeyTokenEntity } from 'src/entities/auth';
import { RedisService } from 'src/common/redis/redis.service';
import { CategoryService } from '../category/category.service';
import { CategoryCourseDto, UpdateCategoryDto } from '../category/dto';

@Injectable()
export class CourseService {
   constructor(
      @InjectRepository(CourseEntity) private courseRepo: CourseRepository,
      @InjectRepository(KeyTokenEntity) private keyTokenRepo: KeyTokenRepository,

      @Inject(forwardRef(() => CategoryService))
      private categoryService: CategoryService,

      private entityManager: EntityManager,
      private redisService: RedisService,
   ) {}

   public async findCourseById(id: string): Promise<MessageResponse> {
      try {
         //check on redis
         const foundRedis = await this.getCourseOnRedis(id);
         if (foundRedis)
            return {
               success: true,
               message: 'create course successfully',
               data: {
                  course: foundRedis,
                  category: foundRedis.categories,
               },
            };
         //find on database
         const foundCourse = await this.courseRepo.findOne({
            where: { id },
         });
         if (!foundCourse)
            return {
               success: false,
               message: 'this course not exist ',
               data: {},
            };
         await this.saveCourseToRedis(foundCourse);
         return {
            success: true,
            message: 'create course successfully',
            data: {
               course: foundCourse,
               category: foundCourse.categories,
            },
         };
      } catch (error) {
         throw new CustomException(
            'create new course failed',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
      }
   }

   public async findByOffSet(offset: number): Promise<MessageResponse> {
      try {
         const limit = 10;
         const listCourse = await this.courseRepo.find({
            skip: limit * (offset - 1),
            take: limit,
         });
         if (!listCourse)
            return {
               success: false,
               message: 'Cannot found',
               data: {},
            };
         return {
            success: true,
            message: 'Found list course in offset ' + offset,
            data: { courses: listCourse, offset: offset, limit: limit },
         };
      } catch (error) {
         throw new CustomException(
            'Find course with offset failed',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
      }
   }

   public async create(createCourseDto: CreateCourseDto, token: string): Promise<MessageResponse> {
      try {
         const refreshToken = token;
         const foundAccount = await this.findAccountByToken(refreshToken);
         //check account
         if (!foundAccount)
            return {
               success: false,
               message: 'cannot found account ',
               data: {},
            };
         // check duplicate title inside found user
         const isDuplicate = await this.isDuplicateTitleCourse(
            createCourseDto.title,
            foundAccount.id,
         );
         if (isDuplicate === true)
            return {
               success: false,
               message: 'create course failed because this title for instructor existed',
               data: {},
            };
         //save course
         const result = await this.entityManager.transaction(async (entityManager) => {
            const newCourse = new CourseEntity({
               ...createCourseDto,
               instructor: foundAccount,
            });
            entityManager.save(newCourse);
            return newCourse;
         });

         if (result === null) throw new Error('Error save course');
         return {
            success: true,
            message: 'create course successfully',
            data: result,
         };
      } catch (error) {
         throw new CustomException(
            'create new course failed',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
      }
   }

   public async updateCourseCategory(
      categoryCourse: CategoryCourseDto,
      token: string,
   ): Promise<MessageResponse> {
      try {
         const foundAccount = await this.findAccountByToken(token);
         //check account
         if (!foundAccount)
            return {
               success: false,
               message: 'cannot found account ',
               data: {},
            };

         const dataFoundCourse = (await this.findCourseById(categoryCourse.courseId)).data;
         const foundCourse: CourseEntity = dataFoundCourse.course;
         const listCategoryEntity = await this.categoryService.getListCategory(
            categoryCourse.categoryIds,
         );

         const result = await this.courseRepo.save({
            ...foundCourse,
            categories: listCategoryEntity,
         });

         await this.delCourseOnRedis(foundCourse.id);

         return {
            success: true,
            message: 'create category_course relationship successfully',
            data: { ...result },
         };
      } catch (error) {
         throw new CustomException(
            'add categoryCourse failed',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
      }
   }

   public async updateCourse(
      updateCourse: UpdateCategoryDto,
      id: string,
      token: string,
   ): Promise<MessageResponse> {
      try {
         const foundAccount = await this.findAccountByToken(token);
         //check account
         if (!foundAccount)
            return {
               success: false,
               message: 'cannot found account ',
               data: {},
            };

         const updateResult = await this.entityManager
            .createQueryBuilder()
            .update(CourseEntity)
            .set({
               ...updateCourse,
            })
            .where('id = :id', { id: id })
            .returning('*')
            .execute();
         if (updateResult.affected == 0)
            return {
               success: false,
               message: 'Update course failed ',
               data: {},
            };

         const updatedCourse = updateResult.raw;
         return {
            success: true,
            message: 'Update course successfully ',
            data: { updatedCourse },
         };
      } catch (error) {
         throw new CustomException(
            'add categoryCourse failed',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
      }
   }

   /**
    * find account an check permission // using temporary because don't know how to using verifyToken
    */
   public async findAccountByToken(refreshToken: string): Promise<AccountEntity | null> {
      try {
         const foundKeyToken = await this.keyTokenRepo.findOne({
            where: {
               refreshToken: refreshToken,
            },
            relations: ['account'],
         });
         if (!foundKeyToken) return null;
         const account = foundKeyToken.account;
         return account;
      } catch (error) {
         throw new CustomException('You must login before create new course', 501, {});
      }
   }

   /**
    * business login : Cannot duplicate title of course once a account
    */
   public async isDuplicateTitleCourse(
      title_course: string,
      id_instructor: string,
   ): Promise<boolean> {
      try {
         const foundCourse = await this.entityManager
            .createQueryBuilder(AccountEntity, 'account')
            .innerJoin('account.courses', 'course')
            .where('course.title = :title', { title: title_course })
            .andWhere('course.instructorId = :id_instructor', {
               id_instructor: id_instructor,
            })
            .getOne();
         if (foundCourse) return true;
         return false;
      } catch (error) {
         throw new CustomException(error);
      }
   }

   /**
    * Using redis service
    */
   public async saveCourseToRedis(course: CourseEntity): Promise<void> {
      await this.redisService.set('course:' + course.id, course, 60 * 30);
   }

   public async getCourseOnRedis(id: string): Promise<CourseEntity> {
      return await this.redisService.get<CourseEntity>('course:' + id);
   }

   public async delCourseOnRedis(id: string): Promise<void> {
      return await this.redisService.delete('course:' + id);
   }
}
