import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from 'src/repositories/courses';
import { EntityManager, JsonContains } from 'typeorm';
import { CategoryEntity } from 'src/entities/courses';
import { CustomException, MessageResponse } from 'src/common';

@Injectable()
export class CategoryService {
   constructor(
      @InjectRepository(CategoryEntity) private categoryRepo: CategoryRepository,
      private entityManager: EntityManager,
   ) {}

   public async create(authToken: string, category: CreateCategoryDto): Promise<MessageResponse> {
      try {
         console.log('cate:' + JSON.stringify(category));
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
         throw new CustomException('Create new category failed', 500, error);
      }
   }
}
