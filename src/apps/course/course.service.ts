import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CREATED, ErrorResponse, HttpExceptionFilter, MessageResponse, OK } from 'src/common';
import { RedisService } from 'src/common/redis/redis.service';
import { AccountEntity } from 'src/entities/accounts';
import { KeyTokenEntity } from 'src/entities/auth';
import { CourseEntity, TagEntity } from 'src/entities/courses';
import { KeyTokenRepository } from 'src/repositories/auth';
import { CourseRepository } from 'src/repositories/courses';
import { EntityManager, In } from 'typeorm';
import { CategoryService } from '../category/category.service';
import { CategoryCourseDto, UpdateCategoryDto } from '../category/dto';
import { TagService } from '../tag/tag.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto';
import { CourseType } from 'src/constants';

@Injectable()
export class CourseService {
   constructor(
      @InjectRepository(CourseEntity) private courseRepo: CourseRepository,
      @InjectRepository(KeyTokenEntity) private keyTokenRepo: KeyTokenRepository,

      @Inject(forwardRef(() => CategoryService))
      private categoryService: CategoryService,
      @Inject(forwardRef(() => TagService))
      private tagService: TagService,

      private entityManager: EntityManager,
      private redisService: RedisService,
   ) {}

   public async findCourseById(id: string): Promise<MessageResponse> {
      try {
         if (!id.trim())
            return new ErrorResponse({
               message: 'Id course not valid',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         //check on redis
         const foundRedis = await this.redisService.get<CourseEntity>('course:' + id);
         if (foundRedis)
            return new OK({
               message: 'Found course redis',
               metadata: foundRedis,
            });
         const queryType = [CourseType.PUBLISH, CourseType.UPCOMING];
         //find on database
         const foundCourse = await this.courseRepo.findOne({
            where: {
               id: id,
               type: In(queryType),
            },
            select: [
               'id',
               'title',
               'description',
               'language',
               'price',
               'discount',
               'instructor',
               'level',
               'thunbnailUrl',
               'type',
            ],
         });
         if (!foundCourse)
            return new ErrorResponse({
               message: 'this course not exist',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         await this.redisService.set('course:' + foundCourse.id, { ...foundCourse }, 60 * 30);

         return new OK({
            message: 'Found course',
            metadata: foundCourse,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'find course failed',
            error: error,
         });
      }
   }

   public async findOwnerCourseById(id: string, token: string): Promise<MessageResponse> {
      try {
         if (!id.trim())
            return new ErrorResponse({
               message: 'Id course not valid',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         const owner = await this.findAccountByToken(token);
         if (!owner)
            return new ErrorResponse({
               message: 'Cannot find owner',
               metadata: {},
            });
         //check on redis
         const foundRedis = await this.redisService.get<CourseEntity>('course:' + id);
         if (foundRedis)
            return new OK({
               message: 'Found course redis',
               metadata: foundRedis,
            });
         //find on database
         const foundCourse = await this.courseRepo.findOne({
            where: {
               id: id,
               instructor: {
                  id: owner.id,
               },
            },
            relations: ['instructor'],
            select: [
               'id',
               'title',
               'description',
               'language',
               'price',
               'discount',
               'instructor',
               'level',
               'thunbnailUrl',
               'type',
            ],
         });
         if (!foundCourse)
            return new ErrorResponse({
               message: 'this course not exist',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         await this.redisService.set('course:' + foundCourse.id, { ...foundCourse }, 60 * 30);

         return new OK({
            message: 'Found course',
            metadata: foundCourse,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'find course failed',
            error: error,
         });
      }
   }

   public async findCategoryOfCourse(idCourse: string): Promise<MessageResponse> {
      try {
         const courseCategory = await this.courseRepo.findOne({
            where: {
               id: idCourse,
            },
            relations: {
               categories: true,
            },
            select: ['categories', 'id'],
         });
         if (courseCategory === null) {
            return new ErrorResponse({
               message: 'This course not exist',
               metadata: {},
               statusCode: 404,
            });
         }
         if (courseCategory.categories.length === 0) {
            return new ErrorResponse({
               message: 'Not exist any category',
               metadata: {},
               statusCode: 404,
            });
         }
         return new OK({
            message: 'Found category by course successfully',
            metadata: courseCategory,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Find category by course id failed',
            error: error,
         });
      }
   }

   public async findTagsOfCourse(idCourse: string): Promise<MessageResponse> {
      try {
         const courseTags = await this.courseRepo.findOne({
            where: {
               id: idCourse,
            },
            relations: {
               tags: true,
            },
            select: ['tags', 'id'],
         });
         if (courseTags === null) {
            return new ErrorResponse({
               message: 'This course not exist',
               metadata: {},
               statusCode: 404,
            });
         }
         if (courseTags.tags.length === 0) {
            return new ErrorResponse({
               message: 'Not exist any tag',
               metadata: {},
               statusCode: 404,
            });
         }
         return new OK({
            message: 'Found tags by course successfully',
            metadata: courseTags,
         });
      } catch (error) {
         console.log(error);
         throw new HttpExceptionFilter({
            message: 'Find tags by course id failed',
            error: error,
         });
      }
   }

   public async findAllPublish(offset: number): Promise<MessageResponse> {
      try {
         if (offset < 1 || !offset) offset = 1;
         const limit = 10;
         const typesQuery = ['publish'];
         const listCourse = await this.courseRepo.find({
            where: {
               type: In(typesQuery),
            },
            select: [
               'id',
               'title',
               'description',
               'language',
               'price',
               'discount',
               'instructor',
               'level',
               'thunbnailUrl',
            ],
            skip: limit * (offset - 1),
            take: limit,
         });

         const totalCourse = (await this.courseRepo.count()) / limit;

         if (listCourse.length === 0)
            return new ErrorResponse({
               message: 'Not have any courses',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         return new OK({
            message: 'Found list course in offset ' + offset,
            metadata: {
               courses: listCourse,
               offset: offset,
               limit: limit,
               totalPage: Math.ceil(totalCourse),
               totalCourseOfPage: listCourse.length,
            },
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Find course with offset failed',
            error: error,
         });
      }
   }

   public async findAllOwner(
      offset: number,
      type: CourseType,
      token: string,
   ): Promise<MessageResponse> {
      try {
         const owner = await this.findAccountByToken(token);
         if (!owner)
            return new ErrorResponse({
               message: 'Cannot find owner',
               metadata: {},
            });
         if (offset < 1 || !offset) offset = 1;
         const limit = 10;
         const typesQuery = type ? [type] : ['draft', 'upcoming', 'publish'];
         const listCourse = await this.courseRepo.find({
            where: {
               type: In(typesQuery),
               instructor: {
                  id: owner.id,
               },
            },
            relations: ['instructor'],
            select: [
               'id',
               'title',
               'description',
               'language',
               'price',
               'discount',
               'instructor',
               'level',
               'thunbnailUrl',
            ],
            skip: limit * (offset - 1),
            take: limit,
         });

         const totalCourse = (await this.courseRepo.count()) / limit;

         if (listCourse.length === 0)
            return new ErrorResponse({
               message: 'Not have any courses',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         return new OK({
            message: 'Found list course in offset ' + offset,
            metadata: {
               courses: listCourse,
               offset: offset,
               limit: limit,
               totalPage: Math.ceil(totalCourse),
               totalCourseOfPage: listCourse.length,
            },
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Find course with offset failed',
            error: error,
         });
      }
   }

   public async create(createCourseDto: CreateCourseDto, token: string): Promise<MessageResponse> {
      try {
         const refreshToken = token;
         const foundAccount = await this.findAccountByToken(refreshToken);
         //check account
         if (!foundAccount)
            return new ErrorResponse({
               message: 'cannot found account',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         const result = await this.entityManager.transaction(async (entityManager) => {
            const newCourse = new CourseEntity({
               ...createCourseDto,
               instructor: foundAccount,
               tags: [],
            });
            const resultSave = entityManager.save(newCourse);
            return resultSave;
         });

         if (result === null)
            return new ErrorResponse({
               message: 'create course failed',
               metadata: {},
            });

         const { instructor, ...course } = result;
         return new CREATED({
            message: 'create course successfully',
            metadata: {
               course: course,
               instructor: {
                  id: instructor.id,
                  email: instructor.email,
                  username: instructor.username,
               },
            },
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'create new course failed',
            error: error,
         });
      }
   }

   public async updateCourseCategories(
      categoryCourse: CategoryCourseDto,
      token: string,
   ): Promise<MessageResponse> {
      try {
         const foundAccount = await this.findAccountByToken(token);
         //check account
         if (!foundAccount)
            return new ErrorResponse({
               message: 'cannot found account',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         const foundCourse = (await this.findCourseById(categoryCourse.courseId)).metadata;
         const listCategoryEntity = await this.categoryService.getListCategory(
            categoryCourse.categoryIds,
         );
         if (listCategoryEntity instanceof ErrorResponse) return listCategoryEntity;

         const result = await this.courseRepo.save({
            ...foundCourse,
            categories: listCategoryEntity,
         });

         await this.redisService.delete('course:' + foundCourse.id);

         return new CREATED({
            message: 'Create category_course relationship successfully',
            metadata: {
               ...result,
            },
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Add categoryCourse failed',
            error: error,
         });
      }
   }

   public async updateCourseTags(idCourse: string, listIdTags: string[]): Promise<MessageResponse> {
      try {
         const courseFound = await this.courseRepo.findOne({
            where: {
               id: idCourse,
            },
            relations: ['tags'],
         });
         if (listIdTags.length === 0) {
            courseFound.tags = [];
            const result = await this.courseRepo.save(courseFound);
            return new OK({
               message: 'Add tags to course successfully',
               metadata: result,
            });
         }
         if (Object.entries(courseFound).length === 0)
            return new ErrorResponse({
               message: 'Cannot found this course',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });
         const getListTagsEntities = await this.tagService.getListTags(listIdTags);
         if (getListTagsEntities instanceof ErrorResponse) {
            return getListTagsEntities;
         } else if (typeof getListTagsEntities[0] == 'number') {
            return new ErrorResponse({
               message: 'Cannot found one element tag in list tags',
               statusCode: HttpStatus.NOT_FOUND,
               metadata: {
                  indexError: getListTagsEntities,
               },
            });
         } else if (typeof getListTagsEntities[0] == 'object') {
            courseFound.tags = getListTagsEntities as TagEntity[];
            const result = await this.courseRepo.save(courseFound);
            return new OK({
               message: 'Add tags to course successfully',
               metadata: result,
            });
         }
      } catch (error) {
         console.log(error);
         throw new HttpExceptionFilter({ message: 'Error add tags to course', error: error });
      }
   }

   public async updateStatusCourse(idCourse: string, type: CourseType): Promise<MessageResponse> {
      try {
         const foundCourse: CourseEntity = (await this.findCourseById(idCourse)).metadata;
         if (Object.keys(foundCourse).length === 0)
            return new ErrorResponse({
               message: 'Cannot found this course',
               metadata: {},
            });
         // const isDuplicate = await this.isDuplicateTitleCourse(foundCourse.title, idCourse);
         // if (isDuplicate)
         //    return new ErrorResponse({
         //       message: 'Duplicate title course publish or upcoming',
         //       metadata: {},
         //       statusCode: 403,
         //    });
         foundCourse.type = type;
         const result = await this.courseRepo.save(foundCourse);
         if (result.type !== type)
            return new ErrorResponse({
               message: 'Update failed',
               statusCode: 500,
               metadata: {},
            });
         return new OK({
            message: 'Update status course successfully',
            metadata: result,
         });
      } catch (error) {
         console.log(error);
         throw new HttpExceptionFilter({
            message: 'Error update status course',
            error: error,
         });
      }
   }

   public async updateCourse(
      updateCourse: UpdateCourseDto,
      id: string,
      token: string,
   ): Promise<MessageResponse> {
      try {
         const foundAccount = await this.findAccountByToken(token);
         //check account
         if (!foundAccount)
            return new ErrorResponse({
               message: 'Cannot found account ',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         const updateResult = await this.entityManager
            .createQueryBuilder()
            .update(CourseEntity)
            .set({
               ...updateCourse,
            })
            .where('id = :id', { id: id })
            .returning('*')
            .execute();
         if (updateResult.affected == 0)
            return new ErrorResponse({
               message: 'Update course failed',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            });

         const updatedCourse = updateResult.raw;
         return new OK({
            message: 'Update course successfully',
            metadata: updatedCourse,
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'add categoryCourse failed',
            error: error,
         });
      }
   }

   /**
    * find account an check permission // using temporary because don't know how to using verifyToken
    */
   public async findAccountByToken(refreshToken: string): Promise<AccountEntity | null> {
      try {
         const foundKeyToken = await this.keyTokenRepo.findOne({
            where: {
               refreshToken: refreshToken,
            },
            relations: ['account'],
         });
         if (!foundKeyToken) return null;
         const account = foundKeyToken.account;
         return account;
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'You must login before create new course',
            error: error,
         });
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
            .andWhere('course.instructorId = :id_instructor', {
               id_instructor: id_instructor,
            })
            .getOne();

         return !foundCourse
            ? false
            : foundCourse.courses[0].type === CourseType.PUBLISH ||
                 foundCourse.courses[0].type === CourseType.UPCOMING;
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Check duplicate title course error',
            error: error,
         });
      }
   }
}
