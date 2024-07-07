import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { CategoryRepository } from 'src/repositories/courses';
import { CategoryEntity, CourseEntity } from 'src/entities/courses';
import { CustomException, MessageResponse } from 'src/common';

import { CourseService } from '../course/course.service';

import { CategoryCourseDto, UpdateCategoryDto, CreateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
   constructor(
      @InjectRepository(CategoryEntity)
      private categoryRepo: CategoryRepository,
      private entityManager: EntityManager,

      @Inject(forwardRef(() => CourseService))
      private courseService: CourseService,
   ) {}

   public async findById(idCategory: string): Promise<MessageResponse> {
      try {
         const foundCategory = await this.categoryRepo.findOne({
            where: {
               id: idCategory,
            },
         });
         if (!foundCategory)
            return {
               success: true,
               message: 'Cannot found this category',
               data: {},
            };
         return {
            success: true,
            message: 'Found category',
            data: foundCategory,
         };
      } catch (error) {
         console.log(error);
         throw new CustomException('Server error', 500, error);
      }
   }

   public async findAll(): Promise<MessageResponse> {
      try {
         const listCategory = await this.categoryRepo.find();
         const message = listCategory.length
            ? 'Found list category successfully'
            : 'Cannot have any category';
         return {
            success: true,
            message: message,
            data: listCategory,
         };
      } catch (error) {
         throw new CustomException(
            'Find all category failed',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
      }
   }

   public async create(authToken: string, category: CreateCategoryDto): Promise<MessageResponse> {
      try {
         // const foundAccount = 1;
         const foundAccount = await this.courseService.findAccountByToken(authToken);
         if (!foundAccount)
            return {
               success: false,
               message: "Don't have permisstion or don't login before",
            };
         const foundCategory = await this.categoryRepo.findOne({
            where: {
               name: category.name,
            },
         });

         if (foundCategory)
            return {
               success: false,
               message: 'This name existed, create failed',
               data: {},
            };
         const result = await this.categoryRepo.save(category);
         return {
            success: true,
            message: 'Create new category successfully',
            data: result,
         };
      } catch (error) {
         throw new CustomException(
            'create new category failed',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
      }
   }

   public async updateCategory(id: string, category: UpdateCategoryDto): Promise<MessageResponse> {
      try {
         const updateResult = await this.entityManager
            .createQueryBuilder()
            .update(CategoryEntity)
            .set({
               name: category.name,
               description: category.description,
            })
            .where('id = :id', { id: id })
            .returning('*')
            .execute();

         if (updateResult.affected == 0)
            return {
               success: false,
               message: 'update category failed',
               data: {},
            };

         const result = updateResult.raw[0];
         return {
            success: true,
            message: 'update category successfully',
            data: { result },
         };
      } catch (error) {
         throw new CustomException(
            ' update category failed',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
      }
   }

   public async getListCategory(listCategoryIds: string[]): Promise<CategoryEntity[]> {
      try {
         let listCategoryEntity: CategoryEntity[] = [];
         await Promise.all(
            listCategoryIds.map(async (id) => {
               const category = await this.findById(id);
               if (!category) throw new Error('cannot found one element category in list category');

               listCategoryEntity.push(category.data);
            }),
         );
         return listCategoryEntity;
      } catch (error) {
         throw new CustomException(
            'add categoryCourse failed',
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
         );
      }
   }
}
