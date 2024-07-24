import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from 'src/entities/courses';
import { TagRepository } from 'src/repositories/courses';
import { CREATED, ErrorResponse, HttpExceptionFilter, MessageResponse, OK } from 'src/common';
import { EntityManager, In } from 'typeorm';
import { CourseService } from '../course/course.service';

@Injectable()
export class TagService {
   constructor(
      @InjectRepository(TagEntity) private tagRepo: TagRepository,
      private readonly entityManager: EntityManager,
      private courseService: CourseService,
   ) {}

   public async findById(id: string): Promise<MessageResponse> {
      try {
         if (!id.trim())
            return new ErrorResponse({
               message: 'Id tag not valid',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         const foundTag = await this.tagRepo.findOne({
            select: ['id', 'name', 'description'],
            where: {
               id,
            },
         });
         if (!foundTag)
            return new ErrorResponse({
               message: 'Cannot found this category',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         return new OK({
            message: 'Found tag',
            metadata: foundTag,
         });
      } catch (error) {
         throw new HttpExceptionFilter({ message: 'Error find tag by id', error: error });
      }
   }

   public async findAll(offset: number): Promise<MessageResponse> {
      try {
         if (offset < 1) offset = 1;
         const limit = 10;
         const listTags = await this.tagRepo.find({
            select: ['id', 'name', 'description'],
            skip: limit * (offset - 1),
            take: limit,
         });

         const totalTags = (await this.tagRepo.count()) / limit;

         if (listTags.length === 0)
            return new ErrorResponse({
               message: 'Not have any tag',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         return new OK({
            message: 'Found list tags successfully',
            metadata: {
               listTags: listTags,
               offset: offset,
               limit: limit,
               totalPage: Math.ceil(totalTags),
               totalCourseOfPage: listTags.length,
            },
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error find all tags',
            error: error,
         });
      }
   }

   public async create(authToken: string, tag: CreateTagDto): Promise<MessageResponse> {
      try {
         const foundAccount = await this.courseService.findAccountByToken(authToken);
         if (!foundAccount)
            return new ErrorResponse({
               message: "Don't have permission or don't login before",
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         const foundTag = await this.tagRepo.findOne({
            where: {
               name: tag.name,
            },
         });

         if (foundTag)
            return new ErrorResponse({
               message: 'This name existed, create failed',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: foundTag,
            });
         const result = await this.tagRepo.save(tag);
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

   public async update(
      authToken: string,
      tag: UpdateTagDto,
      idTag: string,
   ): Promise<MessageResponse> {
      try {
         const foundAccount = await this.courseService.findAccountByToken(authToken);
         if (!foundAccount)
            return new ErrorResponse({
               message: "Don't have permission or don't login before",
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         const result = await this.entityManager
            .createQueryBuilder()
            .update(TagEntity)
            .set({
               ...tag,
            })
            .where('id = :id', { id: idTag })
            .returning('*')
            .execute();
         if (result.affected == 0)
            return new ErrorResponse({
               message: 'Update tag failed',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         const updatedTag = result.raw;
         return new OK({
            message: 'Update category successfully',
            metadata: updatedTag,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Update category have error',
            error: error,
         });
      }
   }
}
