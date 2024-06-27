import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseRepository } from 'src/repositories/courses';
import { EntityManager } from 'typeorm';
import { Request, Response } from 'express';
import { AccountEntity } from 'src/entities/accounts';
import { CustomException, MessageResponse } from 'src/common';
import { CategoryEntity, CourseEntity } from 'src/entities/courses';
import { error } from 'console';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CourseService {
   constructor(
      @InjectRepository(CourseRepository) private courseRepo: CourseRepository,
      private entityManager: EntityManager,
   ) {}

   public async create(
      createCourseDto: CreateCourseDto,
      req: Request,
      res: Response,
   ): Promise<MessageResponse> {
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

         const result = await this.transactionSaveCourse(createCourseDto, foundAccount);
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

   private async transactionSaveCourse(
      createCourseDto: CreateCourseDto,
      foundAccount: AccountEntity,
   ) {
      let result = null;
      await this.entityManager.transaction(async (entityManager) => {
         let foundCategories = [];
         createCourseDto.categoryID.map(async (category) => {
            const foundCategory = await this.entityManager
               .createQueryBuilder(CategoryEntity, 'category')
               .where('id = :categoryID', { categoryID: category })
               .getOne();
            if (!foundAccount) throw new CustomException('Category not exist', 404, {});
            foundCategories.push(foundCategory);
         });
         const course = new CourseEntity({
            ...createCourseDto,
            instructor: foundAccount,
            categories: foundCategories,
         });
         result = await entityManager.save(course);
      });
      return result;
   }

   /**
    * find account an check permission
    */
   private async findAccountByToken(refreshToken: string): Promise<AccountEntity | null> {
      try {
         const foundAccount = await this.entityManager
            .createQueryBuilder(AccountEntity, 'account')
            .innerJoin('account.keyToken', 'keyToken')
            .where('keyToken.refreshToken = :token', { token: refreshToken })
            .getOne();

         return foundAccount;
      } catch (error) {
         throw new CustomException(error);
      }
   }

   /**
    * business login : Cannot duplicate title of course once a account
    */
   private async isDuplicateTitleCourse(
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
