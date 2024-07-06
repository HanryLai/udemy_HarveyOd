import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from 'src/repositories/courses';
import { CategoryEntity } from 'src/entities/courses';
import { CustomException, MessageResponse } from 'src/common';
import { CourseService } from '../course/course.service';

@Injectable()
export class CategoryService {
   constructor(
      @InjectRepository(CategoryEntity) private categoryRepo: CategoryRepository,
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
         const message = listCategory
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
}
