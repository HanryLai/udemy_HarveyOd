import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { CategoryRepository } from 'src/repositories/courses';
import { CategoryEntity } from 'src/entities/courses';
import { CREATED, ErrorResponse, HttpExceptionFilter, MessageResponse, OK } from 'src/common';

import { CourseService } from '../course/course.service';

import { UpdateCategoryDto, CreateCategoryDto } from './dto';

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
         if (!idCategory.trim())
            return new ErrorResponse({
               message: 'Id not valid',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         const foundCategory = await this.categoryRepo.findOne({
            select: ['id', 'name', 'description'],
            where: {
               id: idCategory,
            },
         });
         if (!foundCategory)
            return new ErrorResponse({
               message: 'Cannot found this category',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         return new OK({
            message: 'Found category',
            metadata: foundCategory,
         });
      } catch (error) {
         throw new HttpExceptionFilter({ message: 'Error find category by id', error: error });
      }
   }

   public async findAll(offset: number): Promise<MessageResponse> {
      try {
         if (offset < 1 || !offset) offset = 1;
         const limit = 10;
         const listCategory = await this.categoryRepo.find({
            select: ['id', 'name', 'description'],
            skip: limit * (offset - 1),
            take: limit,
         });
         const totalCategory = (await this.categoryRepo.count()) / limit;

         if (listCategory.length == 0)
            return new ErrorResponse({
               message: 'Not have any category',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         return new OK({
            message: 'Found list category successfully',
            metadata: {
               categories: listCategory,
               offset: offset,
               limit: limit,
               totalPage: Math.ceil(totalCategory),
               totalCourseOfPage: listCategory.length,
            },
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error find all category',
            error: error,
         });
      }
   }

   public async create(authToken: string, category: CreateCategoryDto): Promise<MessageResponse> {
      try {
         const foundAccount = await this.courseService.findAccountByToken(authToken);
         if (!foundAccount)
            return new ErrorResponse({
               message: "Don't have permission or don't login before",
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         const foundCategory = await this.categoryRepo.findOne({
            where: {
               name: category.name,
            },
         });

         if (foundCategory)
            return new ErrorResponse({
               message: 'This name existed, create failed',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: foundCategory,
            });
         const result = await this.categoryRepo.save(category);
         return new CREATED({
            message: 'Create new category successfully',
            metadata: result,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Create new category have error',
            error: error,
         });
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
            .returning(['id', 'name', 'description'])
            .execute();

         if (updateResult.affected == 0)
            return new ErrorResponse({
               message: 'update category failed',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         const result = updateResult.raw[0];
         return new OK({
            message: 'update category successfully',
            metadata: result,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'update category failed',
            error: error,
         });
      }
   }

   public async deleteCategory(id: string): Promise<MessageResponse> {
      try {
         const result = await this.categoryRepo.delete({ id });
         if (result.affected == 0)
            return new ErrorResponse({
               statusCode: 404,
               message: 'delete category failed because not found this category',
               metadata: {},
            });

         return new OK({
            message: 'delete category successfully',
            metadata: result,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'delete category failed',
            error: error,
         });
      }
   }

   public async getListCategory(
      listCategoryIds: string[],
   ): Promise<CategoryEntity[] | ErrorResponse> {
      try {
         if (listCategoryIds.length === 0)
            return new ErrorResponse({
               message: 'List categories id cannot null',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         let listCategoryEntity: CategoryEntity[] = [];
         let isError = false;
         await Promise.all(
            listCategoryIds.map(async (id) => {
               const messageResponse = await this.findById(id);
               const category = messageResponse.metadata;
               if (Object.keys(category).length === 0) {
                  isError = true;
                  return null;
               }
               listCategoryEntity.push(category);
            }),
         );

         if (isError)
            return new ErrorResponse({
               message: 'Cannot found one element category in list category',
               statusCode: HttpStatus.NOT_FOUND,
               metadata: {},
            });
         return listCategoryEntity;
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Get list categories failed',
            error: error,
         });
      }
   }
}
