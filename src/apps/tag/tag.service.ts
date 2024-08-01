import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CREATED, ErrorResponse, HttpExceptionFilter, MessageResponse, OK } from 'src/common';
import { TagEntity } from 'src/entities/courses';
import { TagRepository } from 'src/repositories/courses';
import { EntityManager } from 'typeorm';
import { CourseService } from '../course/course.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagService {
   constructor(
      @InjectRepository(TagEntity)
      private tagRepo: TagRepository,
      private readonly entityManager: EntityManager,

      @Inject(forwardRef(() => CourseService))
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
         if (offset < 1 || !offset) offset = 1;
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
               totalTagsOfPage: listTags.length,
            },
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error find all tags',
            error: error,
         });
      }
   }

   public async create(tag: CreateTagDto): Promise<MessageResponse> {
      try {
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

   public async update(tag: UpdateTagDto, idTag: string): Promise<MessageResponse> {
      try {
         if (!idTag.trim()) {
            return new ErrorResponse({
               message: 'ID not empty',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         }

         let validUpdate = true;
         if (tag?.name) validUpdate = !(await this.isDuplicateTagName(tag.name, idTag)); // check valid update name

         if (!validUpdate)
            // Error duplicate name
            return new ErrorResponse({
               message: 'This name existed, update failed',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         //update tag
         const result = await this.entityManager
            .createQueryBuilder()
            .update(TagEntity)
            .set({
               ...tag,
            })
            .where('id = :id', { id: idTag })
            .returning('*')
            .execute();
         // Error not found
         if (result.affected == 0)
            return new ErrorResponse({
               message: 'Cannot found this tag',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         // successfully
         const updatedTag = result.raw;
         return new OK({
            message: 'Update tag successfully',
            metadata: updatedTag,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Update tag have error',
            error: error,
         });
      }
   }

   public async getListTags(listIdTags: string[]): Promise<TagEntity[] | number[] | ErrorResponse> {
      try {
         let listTagEntities: TagEntity[] = [];
         let indexError: number[] = [];

         await Promise.all(
            listIdTags.map(async (id, index) => {
               const tagFound = await this.findById(id);
               const tagEntity = tagFound.metadata;
               if (Object.keys(tagEntity).length === 0) {
                  indexError.push(index);
               }
               listTagEntities.push(tagEntity);
            }),
         );
         if (indexError.length !== 0) return indexError;
         return listTagEntities;
      } catch (error) {
         console.log(error);
         throw new HttpExceptionFilter({ message: 'Error get list tags ', error: error });
      }
   }

   public async delete(id: string): Promise<MessageResponse> {
      try {
         const result = await this.tagRepo.delete({ id });
         if (!result.affected)
            return new ErrorResponse({
               message: 'Not found this tag',
               statusCode: 404,
               metadata: {},
            });
         return new OK({
            message: 'Delete this tag successfully',
            metadata: 'Effective ' + result.affected,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Delete tag have error',
            error: error,
         });
      }
   }

   public async isDuplicateTagName(name: string, id: string): Promise<boolean> {
      try {
         const tagName = name;
         const foundTagDuplicate = await this.tagRepo.findOne({
            where: {
               name: tagName,
            },
            select: ['name', 'description', 'id'],
         });
         // same name and same ID => true, else false
         return foundTagDuplicate && foundTagDuplicate.id !== id ? true : false;
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error check duplicate name tag',
            error: error,
         });
      }
   }
}
