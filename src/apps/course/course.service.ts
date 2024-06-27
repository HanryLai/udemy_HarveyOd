import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { CategoryRepository, CourseRepository } from 'src/repositories/courses';
import { EntityManager } from 'typeorm';
import { Request } from 'express';
import { AccountEntity } from 'src/entities/accounts';
import { CustomException, MessageResponse } from 'src/common';
import { CategoryEntity, CourseEntity } from 'src/entities/courses';
import { error } from 'console';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountRepository } from 'src/repositories/accounts';
import { KeyTokenRepository } from 'src/repositories/auth';
import { KeyTokenEntity } from 'src/entities/auth';

@Injectable()
export class CourseService {
   constructor(
      @InjectRepository(CourseEntity) private courseRepo: CourseRepository,
      @InjectRepository(KeyTokenEntity) private keyTokenRepo: KeyTokenRepository,
      @InjectRepository(CategoryEntity) private categoryRepo: CategoryRepository,
      private entityManager: EntityManager,
   ) {}

   public async create(createCourseDto: CreateCourseDto, req: Request): Promise<MessageResponse> {
      try {
         const refreshToken = req.headers.authorization.split(' ')[1];
         const foundAccount = await this.findAccountByToken(refreshToken);
         //check account
         if (!foundAccount) return { success: false, message: 'cannot found account ', data: {} };
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
         // get list category
         const listCategories = await this.findCategories(createCourseDto.categoryID);
         //save course
         const result = await this.transactionSaveCourse(
            createCourseDto,
            foundAccount,
            listCategories,
         );
         console.log('result' + result);

         if (result === null) throw new error('Error save course');
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

   public async findCategories(listCategoryId: string[]): Promise<CategoryEntity[]> {
      try {
         let foundCategories: CategoryEntity[] = [];
         listCategoryId.map(async (categoryId) => {
            const foundCategory = await this.categoryRepo.findOne({
               where: {
                  id: categoryId,
               },
            });
            if (!foundCategory)
               // throw new CustomException('Category not exist', 404, {});
               console.log('not found category');
            foundCategories.push(foundCategory);
         });

         return foundCategories;
      } catch (error) {
         throw new CustomException(error);
      }
   }

   public async transactionSaveCourse(
      createCourseDto: CreateCourseDto,
      foundAccount: AccountEntity,
      foundCategories: CategoryEntity[],
   ) {
      try {
         let result = null;
         await this.entityManager.transaction(async (entityManager) => {
            const course = new CourseEntity({
               ...createCourseDto,
               instructor: foundAccount,
               categories: foundCategories,
            });
            console.log('course entity: ' + course);
            result = await this.courseRepo.save(course);
         });
         return result;
      } catch (error) {
         throw new CustomException(error);
      }
   }

   /**
    * find account an check permission // using temporary because don't know how to using verifyToken
    */
   private async findAccountByToken(refreshToken: string): Promise<AccountEntity | null> {
      try {
         const foundKeyToken = await this.keyTokenRepo.findOne({
            where: {
               refreshToken: refreshToken,
            },
            relations: ['account'],
         });
         console.log('foundKeyToken' + foundKeyToken.account.email);
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
            .andWhere('course.instructorId = :id_instructor', { id_instructor: id_instructor })
            .getOne();
         if (foundCourse) return true;
         return false;
      } catch (error) {
         throw new CustomException(error);
      }
   }
}
