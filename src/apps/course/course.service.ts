import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseRepository } from 'src/repositories/courses';
import { EntityManager } from 'typeorm';
import { AccountEntity } from 'src/entities/accounts';
import { CREATED, ErrorResponse, HttpExceptionFilter, MessageResponse, OK } from 'src/common';
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
         if (!id.trim())
            return new ErrorResponse({
               message: 'Id course not valid',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         //check on redis
         const foundRedis = await this.redisService.get<CourseEntity>('course:' + id);
         if (foundRedis)
            return new OK({
               message: 'Found course redis',
               metadata: foundRedis,
            });
         //find on database
         const foundCourse = await this.courseRepo.findOne({
            where: { id },
            select: [
               'id',
               'title',
               'description',
               'language',
               'price',
               'discount',
               'instructor',
               'level',
               'thunbnailUrl',
            ],
         });
         if (!foundCourse)
            return new ErrorResponse({
               message: 'this course not exist',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         await this.redisService.set('course:' + foundCourse.id, { ...foundCourse }, 60 * 30);

         return new OK({
            message: 'Found course',
            metadata: foundCourse,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'find course failed',
            error: error,
         });
      }
   }

   public async findByOffSet(offset: number): Promise<MessageResponse> {
      try {
         if (offset < 1 || !offset) offset = 1;
         const limit = 10;
         const listCourse = await this.courseRepo.find({
            select: [
               'id',
               'title',
               'description',
               'language',
               'price',
               'discount',
               'instructor',
               'level',
               'thunbnailUrl',
            ],
            skip: limit * (offset - 1),
            take: limit,
         });

         const totalCourse = (await this.courseRepo.count()) / limit;

         if (listCourse.length === 0)
            return new ErrorResponse({
               message: 'Not have any courses',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         return new OK({
            message: 'Found list course in offset ' + offset,
            metadata: {
               courses: listCourse,
               offset: offset,
               limit: limit,
               totalPage: Math.ceil(totalCourse),
               totalCourseOfPage: listCourse.length,
            },
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Find course with offset failed',
            error: error,
         });
      }
   }

   public async create(createCourseDto: CreateCourseDto, token: string): Promise<MessageResponse> {
      try {
         const refreshToken = token;
         const foundAccount = await this.findAccountByToken(refreshToken);
         //check account
         if (!foundAccount)
            return new ErrorResponse({
               message: 'cannot found account',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         // check duplicate title inside found user
         const isDuplicate = await this.isDuplicateTitleCourse(
            createCourseDto.title,
            foundAccount.id,
         );
         if (isDuplicate === true)
            return new ErrorResponse({
               message: 'create course failed because this title for instructor existed',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         //save course
         const result = await this.entityManager.transaction(async (entityManager) => {
            const newCourse = new CourseEntity({
               ...createCourseDto,
               instructor: foundAccount,
            });
            entityManager.save(newCourse);
            return newCourse;
         });

         if (result === null)
            return new ErrorResponse({
               message: 'create course failed',
               metadata: {},
            });

         const { instructor, ...course } = result;
         return new CREATED({
            message: 'create course successfully',
            metadata: {
               course: course,
               instructor: {
                  id: instructor.id,
                  email: instructor.email,
                  username: instructor.username,
               },
            },
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'create new course failed',
            error: error,
         });
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
            return new ErrorResponse({
               message: 'cannot found account',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         const foundCourse = (await this.findCourseById(categoryCourse.courseId)).metadata;
         const listCategoryEntity = await this.categoryService.getListCategory(
            categoryCourse.categoryIds,
         );
         if (listCategoryEntity instanceof ErrorResponse) return listCategoryEntity;

         const result = await this.courseRepo.save({
            ...foundCourse,
            categories: listCategoryEntity,
         });

         await this.redisService.delete('course:' + foundCourse.id);

         return new CREATED({
            message: 'Create category_course relationship successfully',
            metadata: {
               ...result,
            },
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Add categoryCourse failed',
            error: error,
         });
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
            return new ErrorResponse({
               message: 'Cannot found account ',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

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
            return new ErrorResponse({
               message: 'Update course failed',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         const updatedCourse = updateResult.raw;
         return new OK({
            message: 'Update course successfully',
            metadata: updatedCourse,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'add categoryCourse failed',
            error: error,
         });
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
         throw new HttpExceptionFilter({
            message: 'You must login before create new course',
            error: error,
         });
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
         throw new HttpExceptionFilter({
            message: 'Check duplicate title course error',
            error: error,
         });
      }
   }
}
