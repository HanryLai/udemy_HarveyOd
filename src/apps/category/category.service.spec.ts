import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from 'src/repositories/courses';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryEntity, CourseEntity } from 'src/entities/courses';
import { EntityManager } from 'typeorm';
import { CourseService } from '../course/course.service';
import { ErrorResponse, HttpExceptionFilter, OK } from 'src/common';
import { HttpStatus } from '@nestjs/common';

describe('Category Service', () => {
   let service: CategoryService;
   let categoryRepo: CategoryRepository;
   let entityManager: EntityManager;
   let courseService: CourseService;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            CategoryService,
            {
               provide: getRepositoryToken(CategoryEntity),
               useClass: CategoryRepository,
            },
            {
               provide: EntityManager,
               useValue: {},
            },
            {
               provide: CourseService,
               useValue: {},
            },
         ],
      }).compile();

      service = module.get<CategoryService>(CategoryService);
      categoryRepo = module.get(getRepositoryToken(CategoryEntity));
      entityManager = module.get<EntityManager>(EntityManager);
      courseService = module.get<CourseService>(CourseService);
   });
   it('should be defined', () => {
      expect(service).toBeDefined();
   });

   describe('findById', () => {
      it('should return category if found', async () => {
         const idCategory = '8c648080-5db6-42ad-b42c-6e19741f3dff';
         const createAtString = '2024-07-06T04:59:18.465Z';
         const updateAtString = '2024-07-06T04:59:18.465Z';
         const createAtDate = new Date(createAtString);
         const updateAtDate = new Date(updateAtString);
         const foundCategory: CategoryEntity = {
            id: '8c648080-5db6-42ad-b42c-6e19741f3dff',
            createAt: createAtDate,
            updateAt: updateAtDate,
            createBy: '',
            isActive: false,
            isArchived: false,
            name: 'font-end',
            description: 'string',
         };
         jest.spyOn(categoryRepo, 'findOne').mockResolvedValue(foundCategory);

         const result = await service.findById(idCategory);

         expect(result).toEqual(
            new OK({
               message: 'Found category',
               metadata: {
                  foundCategory,
               },
            }),
         );
         expect(categoryRepo.findOne).toHaveBeenCalledWith({ where: { id: idCategory } });
      });

      it('should return error response if category not found', async () => {
         const idCategory = '1';
         jest.spyOn(categoryRepo, 'findOne').mockResolvedValue(null);

         const result = await service.findById(idCategory);

         expect(result).toEqual(
            new ErrorResponse({
               message: 'Cannot found this category',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            }),
         );
         expect(categoryRepo.findOne).toHaveBeenCalledWith({ where: { id: idCategory } });
      });

      it('should throw HttpExceptionFilter if an error occurs', async () => {
         const idCategory = '1';
         const error = new Error('Some error');
         jest.spyOn(categoryRepo, 'findOne').mockRejectedValue(error);

         try {
            await service.findById(idCategory);
         } catch (e) {
            expect(e).toBeInstanceOf(HttpExceptionFilter);
            expect(e.message).toBe('Error find category by id');
         }

         expect(categoryRepo.findOne).toHaveBeenCalledWith({ where: { id: idCategory } });
      });
   });
});
