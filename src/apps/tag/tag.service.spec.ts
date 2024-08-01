import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TagRepository } from 'src/repositories/courses';
import { EntityManager, Repository } from 'typeorm';
import { CourseService } from '../course/course.service';
import { TagService } from './tag.service';
import { TagEntity } from 'src/entities/courses';
import { CREATED, ErrorResponse, HttpExceptionFilter } from 'src/common';

describe('Tag Service', () => {
   let service: TagService;

   let tagRepository: TagRepository;
   let entityManager: Partial<EntityManager>;
   let courseService: CourseService;
   const entityManagerMock = {};
   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            TagService,
            {
               provide: getRepositoryToken(TagEntity),
               useClass: TagRepository,
            },
            {
               provide: EntityManager,
               useValue: entityManagerMock,
            },
            {
               provide: CourseService,
               useValue: {
                  findAccountByToken: jest.fn(),
               },
            },
         ],
      }).compile();
      service = module.get<TagService>(TagService);
      tagRepository = module.get(getRepositoryToken(TagEntity));
      entityManager = module.get<EntityManager>(EntityManager);
      courseService = module.get<CourseService>(CourseService);
   });

   it('should be defined', () => {
      expect(service).toBeDefined();
   });

   const mockTagEntity = new TagEntity({
      id: '1',
      name: 'toeic',
      description: 'Level of english certificate ',
   });

   const listMockTagEntities = [
      new TagEntity({
         id: '1',
         name: 'toeic',
         description: 'Level of english certificate ',
      }),
      new TagEntity({
         id: '2',
         name: 'backend',
         description: 'Level of english certificate ',
      }),
   ];

   describe('TagService - findById', () => {
      it('should return tag when valid id is provided', async () => {
         const mockTag = mockTagEntity;
         jest.spyOn(tagRepository, 'findOne').mockResolvedValue(mockTag);

         const result = await service.findById('1');

         expect(result.message).toEqual('Found tag');
         expect(result.metadata).toEqual(mockTag);
         expect(result.statusCode).toBe(200);
      });
      it('should return error when id is empty', async () => {
         const result = await service.findById('');

         expect(result.message).toBe('Id tag not valid');
         expect(result.statusCode).toBe(400);
      });

      it('should return error when id is whitespace only', async () => {
         const result = await service.findById('   ');

         expect(result.message).toBe('Id tag not valid');
         expect(result.statusCode).toBe(400);
      });

      it('should return error when tag is not found', async () => {
         jest.spyOn(tagRepository, 'findOne').mockResolvedValue(null);

         const result = await service.findById('1');

         expect(result.message).toBe('Cannot found this category');
         expect(result.statusCode).toBe(400);
      });

      it('should throw an error when repository method throws', async () => {
         jest.spyOn(tagRepository, 'findOne').mockRejectedValue(new Error('Database error'));

         try {
            await service.findById('1');
         } catch (error) {
            expect(error.message).toBe('Error find tag by id');
            expect(error.error.message).toBe('Database error');
         }
      });
   });

   describe('Find All', () => {
      it('should return tags with valid offset', async () => {
         const mockTags = listMockTagEntities;
         jest.spyOn(tagRepository, 'find').mockResolvedValue(listMockTagEntities);
         jest.spyOn(tagRepository, 'count').mockResolvedValue(10);

         const result = await service.findAll(1);

         expect(result.metadata.listTags).toEqual(mockTags);
         expect(result.metadata.offset).toBe(1);
         expect(result.metadata.limit).toBe(10);
         expect(result.metadata.totalPage).toBe(1);
         expect(result.metadata.totalTagsOfPage).toBe(mockTags.length);
      });
   });

   it('should normalize offset to 1 if offset is less than 1 ', async () => {
      const mockTags = listMockTagEntities;
      jest.spyOn(tagRepository, 'find').mockResolvedValue(mockTags);
      jest.spyOn(tagRepository, 'count').mockResolvedValue(10);

      const result = await service.findAll(0);

      expect(result.metadata.offset).toBe(1);
   });

   it('should normalize offset is undefined ', async () => {
      const mockTags = listMockTagEntities;
      jest.spyOn(tagRepository, 'find').mockResolvedValue(mockTags);
      jest.spyOn(tagRepository, 'count').mockResolvedValue(10);

      const result = await service.findAll(undefined);

      expect(result.metadata.offset).toBe(1);
   });

   it('should return error if offset is greater than total pages', async () => {
      jest.spyOn(tagRepository, 'find').mockResolvedValue([]);
      jest.spyOn(tagRepository, 'count').mockResolvedValue(10);

      const result = await service.findAll(2);

      expect(result.message).toBe('Not have any tag');
      expect(result.statusCode).toBe(400);
   });

   it('should return error if no tags available', async () => {
      jest.spyOn(tagRepository, 'find').mockResolvedValue([]);
      jest.spyOn(tagRepository, 'count').mockResolvedValue(0);

      const result = await service.findAll(1);

      expect(result.message).toBe('Not have any tag');
      expect(result.statusCode).toBe(400);
   });

   it('should throw an error if repository methods throw', async () => {
      jest.spyOn(tagRepository, 'find').mockRejectedValue(new Error('Database error'));

      try {
         await service.findAll(1);
      } catch (error) {
         console.log(error.message);
         expect(error.error.message).toBe('Database error');
         // expect(error)
      }
   });

   it('should handle partial tags on the last page', async () => {
      const mockTags = listMockTagEntities;
      jest.spyOn(tagRepository, 'find').mockResolvedValue(mockTags);
      jest.spyOn(tagRepository, 'count').mockResolvedValue(11);

      const result = await service.findAll(2);

      expect(result.metadata.listTags).toEqual(mockTags);
      expect(result.metadata.offset).toBe(2);
      expect(result.metadata.limit).toBe(10);
      expect(result.metadata.totalPage).toBe(2);
      expect(result.metadata.totalTagsOfPage).toBe(mockTags.length);
   });

   it('should correctly paginate when total tags is a multiple of the limit', async () => {
      const mockTags = Array.from(
         { length: 10 },
         (_, i) =>
            new TagEntity({
               id: `${i + 1}`,
               name: `Tag ${i + 1}`,
               description: `Description ${i + 1}`,
            }),
      );
      jest.spyOn(tagRepository, 'find').mockResolvedValue(mockTags);
      jest.spyOn(tagRepository, 'count').mockResolvedValue(20);

      const result = await service.findAll(2);

      expect(result.metadata.listTags).toEqual(mockTags);
      expect(result.metadata.totalPage).toBe(2);
      expect(result.metadata.totalTagsOfPage).toBe(mockTags.length);
   });

   describe('Create new tag', () => {
      it('should create a new tag successfully', async () => {
         const newTag = { name: 'New Tag', description: 'Tag Description' };

         jest.spyOn(tagRepository, 'findOne').mockResolvedValue(null);
         jest.spyOn(tagRepository, 'save').mockResolvedValue(newTag as any);

         const result = await service.create(newTag);

         expect(result).toBeInstanceOf(CREATED);
         expect(result.message).toBe('Create new category successfully');
         expect(result.metadata).toEqual(newTag);
      });

      it('should return an error if the tag name already exists', async () => {
         const existingTag = { id: '1', name: 'Existing Tag', description: 'Tag Description' };
         const newTag = { name: 'Existing Tag', description: 'Tag Description' };

         jest.spyOn(tagRepository, 'findOne').mockResolvedValue(existingTag as any);

         const result = await service.create(newTag);

         expect(result).toBeInstanceOf(ErrorResponse);
         expect(result.message).toBe('This name existed, create failed');
         expect(result.metadata).toEqual(existingTag);
      });

      it('should throw an error if there is an issue creating the tag', async () => {
         const newTag = { name: 'New Tag', description: 'Tag Description' };

         jest.spyOn(tagRepository, 'findOne').mockResolvedValue(null);
         jest.spyOn(tagRepository, 'save').mockRejectedValue(new Error('Database error'));

         try {
            await service.create(newTag);
         } catch (error) {
            expect(error.error.message).toBe('Database error');
            expect(error).toBeInstanceOf(HttpExceptionFilter);
            expect(error.message).toBe('Create new category have error');
         }
      });
   });
});
