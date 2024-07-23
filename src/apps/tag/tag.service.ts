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

   public async findAll(): Promise<MessageResponse> {
      try {
         const listTags = await this.tagRepo.find({
            select: ['id', 'name', 'description'],
         });
         if (listTags.length == 0)
            return new ErrorResponse({
               message: 'Not have any tag',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         return new OK({
            message: 'Found list tags successfully',
            metadata: listTags,
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
}
