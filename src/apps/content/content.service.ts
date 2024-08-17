import { Injectable } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseContentEntity } from 'src/entities/courses';
import { CourseContentRepository } from 'src/repositories/courses';
import { CourseService } from '../course/course.service';
import { EntityManager } from 'typeorm';
import { CREATED, ErrorResponse, HttpExceptionFilter, MessageResponse, OK } from 'src/common';
import { AccountEntity } from 'src/entities/accounts';
import { CourseType } from 'src/constants';

@Injectable()
export class ContentService {
   constructor(
      @InjectRepository(CourseContentEntity) private contentRepo: CourseContentRepository,
      private courseService: CourseService,
      private entityManager: EntityManager,
   ) {}

   public async findById(id: string): Promise<MessageResponse> {
      try {
         const foundContent = await this.contentRepo.findOne({
            where: {
               id: id,
               course: {
                  type: CourseType.PUBLISH,
               },
            },
         });
         if (!foundContent)
            return new ErrorResponse({
               message: 'Cannot found any content',
               metadata: {},
            });
         return new OK({
            message: 'Found this content',
            metadata: foundContent,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Find content by id error',
            error: error,
         });
      }
   }

   public async findOwnerById(id: string, token: string): Promise<MessageResponse> {
      try {
         //check account
         let foundAccount = await this.courseService.checkAccount(token);
         if (foundAccount instanceof ErrorResponse) return foundAccount;

         foundAccount = foundAccount as AccountEntity;
         const foundContent = await this.contentRepo.findOne({
            where: {
               id: id,
               course: {
                  instructor: {
                     id: foundAccount.id,
                  },
               },
            },
            relations: ['course', 'course.instructor'],
            select: ['id', 'title', 'description', 'orderIndex', 'contentData'],
         });

         if (!foundContent)
            return new ErrorResponse({
               message: 'Cannot found any content',
               metadata: {},
            });
         return new OK({
            message: 'Found this content',
            metadata: foundContent,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Find content by id error',
            error: error,
         });
      }
   }

   public async create(
      idCourse: string,
      createContentDto: CreateContentDto,
      token: string,
   ): Promise<MessageResponse> {
      try {
         const foundCourse = await this.courseService.findOwnerCourseById(idCourse, token);
         if (foundCourse instanceof ErrorResponse) return foundCourse;

         const quantityContent = await this.contentRepo.count({
            where: {
               course: {
                  id: idCourse,
               },
            },
         });

         let entityDeclare = new CourseContentEntity({
            ...createContentDto,
            orderIndex: quantityContent,
            course: foundCourse.metadata,
         });
         console.log(entityDeclare);

         const entity = this.contentRepo.create(entityDeclare);
         const created = await this.contentRepo.save(entity);
         if (!created)
            return new ErrorResponse({
               message: 'Cannot create this content',
               metadata: {},
               statusCode: 500,
            });
         const { course, ...resultReturn } = created;
         return new CREATED({
            message: 'Create new content of course successfully',
            metadata: resultReturn,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Create content of course error',
            error: error,
         });
      }
   }

   public async updateById(
      id: string,
      updateContentDto: UpdateContentDto,
      token: string,
   ): Promise<MessageResponse> {
      try {
         let account = await this.courseService.checkAccount(token);
         if (account instanceof ErrorResponse) return account;
         account = account as AccountEntity;

         const foundContent = await this.contentRepo.findOne({
            where: {
               id: id,
               course: {
                  instructor: {
                     id: account.id,
                  },
               },
            },
         });
         if (!foundContent)
            return new ErrorResponse({
               message: 'Not found content',
               metadata: {},
               statusCode: 404,
            });
         const updateContent = { ...foundContent, ...updateContentDto };
         console.log(updateContent);
         const updateResult = await this.contentRepo.save(updateContent);

         return new OK({
            message: 'Update content successfully',
            metadata: updateResult,
         });
      } catch (error) {
         console.log(error);
         throw new HttpExceptionFilter({
            message: 'Update content of course error',
            error: error,
         });
      }
   }

   public async deleteContent(id: string): Promise<MessageResponse> {
      try {
         console.log(id);
         const foundContent = await this.contentRepo.findOne({ where: { id } });
         if (!foundContent)
            return new ErrorResponse({
               message: 'Cannot found this content',
               statusCode: 404,
               metadata: {},
            });
         const result = await this.entityManager.transaction(async (entityManager) => {
            const taskDelete = entityManager
               .createQueryBuilder()
               .delete()
               .from(CourseContentEntity, 'content')
               .where('id = :id', { id: id })
               .execute();

            const taskUpdateOrderIndex = entityManager
               .createQueryBuilder()
               .update(CourseContentEntity)
               .set({
                  orderIndex: () => {
                     return '"order_index" - 1';
                  },
               })
               .where('"order_index" > :index', { index: foundContent.orderIndex })
               .execute();
            return Promise.all([taskDelete, taskUpdateOrderIndex]);
         });
         console.log(result);
         return new OK({
            message: 'Delete content of course successfully',
            metadata: {},
         });
      } catch (error) {
         console.log(error);
         throw new HttpExceptionFilter({
            message: 'Delete content of course error',
            error: error,
         });
      }
   }

   public async updateContentOrderIndex(
      contentId: string,
      newOrderIndex: number,
      token: string,
   ): Promise<MessageResponse> {
      try {
         // find content and check permission
         const foundContent = await this.findOwnerById(contentId, token);
         if (foundContent instanceof ErrorResponse) return foundContent;

         const found: CourseContentEntity = foundContent.metadata;
         const currentIndex = found.orderIndex;
         //check valid order
         if (newOrderIndex < 0) {
            return new ErrorResponse({
               message: 'Order index must be greater than or equal to 0',
               metadata: {},
            });
         }

         // Check same content
         if (found.orderIndex === newOrderIndex)
            return new ErrorResponse({
               message: 'This module still is this order',
               metadata: {},
            });
         // check valid order
         const length = await this.contentRepo.count({
            where: { course: { id: found.course.id } },
         });
         if (newOrderIndex >= length) {
            return new ErrorResponse({
               message: 'Order index must be less than ' + length,
               metadata: {},
            });
         }
         // transaction save order index
         const result = await this.entityManager.transaction(async (transactionManager) => {
            const courseId = foundContent.metadata.course.id;

            // push down content have order index between new order index  and current index
            if (newOrderIndex < currentIndex) {
               await transactionManager
                  .createQueryBuilder()
                  .update(CourseContentEntity)
                  .set({ orderIndex: () => '"order_index" + 1' })
                  .where('"order_index" >= :newOrderIndex AND "order_index" < :currentIndex', {
                     newOrderIndex,
                     currentIndex,
                  })
                  .andWhere('courseId = :courseId', { courseId })
                  .execute();
            }

            if (newOrderIndex > currentIndex) {
               await transactionManager
                  .createQueryBuilder()
                  .update(CourseContentEntity)
                  .set({ orderIndex: () => '"order_index" - 1' })
                  .where('"order_index" <= :newOrderIndex AND "order_index" > :currentIndex', {
                     newOrderIndex,
                     currentIndex,
                  })
                  .andWhere('courseId = :courseId', { courseId })
                  .execute();
            }

            // Update order index of content
            return await transactionManager
               .createQueryBuilder()
               .update(CourseContentEntity)
               .set({ orderIndex: newOrderIndex })
               .where('id = :contentId', { contentId })
               .execute();
         });
         if (result instanceof ErrorResponse) return result;
         return new OK({
            message: 'Update order index of module successfully',
            metadata: result,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error update order index of content',
            error: error,
         });
      }
   }
}
