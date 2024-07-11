import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from 'src/repositories/courses';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryEntity, CertificateEntity, CourseEntity } from 'src/entities/courses';
import { EntityManager } from 'typeorm';
import { CourseService } from '../course/course.service';
import { CREATED, ErrorResponse, HttpExceptionFilter, OK } from 'src/common';
import { HttpStatus } from '@nestjs/common';
import { CreateCategoryDto } from './dto';
import { AccountEntity } from 'src/entities/accounts';

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
               useValue: {
                  findAccountByToken: jest.fn(), // Đảm bảo phương thức được mock
               },
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
            isActive: true,
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

   describe('findAll', () => {
      it('should return all categories', async () => {
         const createAtDate = new Date();
         const updateAtDate = new Date();
         const foundCategory: CategoryEntity[] = [
            {
               id: '8c648080-5db6-42ad-b42c-6e19741f3dfg',
               createAt: createAtDate,
               updateAt: updateAtDate,
               createBy: '',
               isActive: false,
               isArchived: false,
               name: 'font-end',
               description: 'string',
            },
         ];

         // Giả lập phương thức `find` của `categoryRepo` để trả về `foundCategory`
         jest.spyOn(categoryRepo, 'find').mockResolvedValue(foundCategory);

         const result = await service.findAll();

         expect(result).toEqual({
            message: 'Found list category successfully',
            metadata: { listCategory: foundCategory },
            statusCode: 200,
         });
         expect(categoryRepo.find).toHaveBeenCalledTimes(1);
      });

      it("should return message 'cannot found any category' ", async () => {
         jest.spyOn(categoryRepo, 'find').mockResolvedValue([]);
         const result = await service.findAll();
         expect(result).toEqual(
            new ErrorResponse({
               message: 'Not have any category',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            }),
         );
         expect(categoryRepo.find).toHaveBeenCalledTimes(1);
      });

      it('should throw HttpExceptionFilter if an error occurs', async () => {
         const err = new Error('Some thing wrong');
         jest.spyOn(categoryRepo, 'find').mockRejectedValue(err);
         try {
            await service.findAll();
         } catch (error) {
            expect(error).toBeInstanceOf(HttpExceptionFilter);
            expect(error.message).toBe('Error find all category');
         }
      });
   });

   describe('create', () => {
      it('should return error response if account not found', async () => {
         jest.spyOn(courseService, 'findAccountByToken').mockResolvedValue(null);

         const response = await service.create('tokenInvalid', {
            name: 'backend',
            description: 'Description backend categogy',
         });

         expect(response).toEqual(
            new ErrorResponse({
               message: "Don't have permission or don't login before",
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            }),
         );
      });

      it('should return error response if category already exists', async () => {
         const mockCategory: CategoryEntity = {
            id: '1',
            name: 'Existing Category',
            description: 'Some description',
            createAt: new Date(),
            updateAt: new Date(),
            createBy: '',
            isActive: false,
            isArchived: false,
         };

         const mockUser = {
            username: 'testuser',
            password: 'password123',
            email: 'testuser@example.com',
         } as unknown as AccountEntity;

         jest.spyOn(courseService, 'findAccountByToken').mockResolvedValue(mockUser);
         jest.spyOn(categoryRepo, 'findOne').mockResolvedValue(mockCategory);

         const response = await service.create('validToken', {
            name: 'Existing Category',
         } as CreateCategoryDto);

         expect(response).toEqual(
            new ErrorResponse({
               message: 'This name existed, create failed',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: { foundCategory: mockCategory },
            }),
         );
      });
      it('should create new category successfully', async () => {
         const mockCategory: CategoryEntity = {
            id: '1',
            name: 'Existing Category',
            description: 'Some description',
            createAt: new Date(),
            updateAt: new Date(),
            createBy: '',
            isActive: false,
            isArchived: false,
         };

         const mockUser = {
            username: 'testuser',
            password: 'password123',
            email: 'testuser@example.com',
         } as unknown as AccountEntity;

         jest.spyOn(courseService, 'findAccountByToken').mockResolvedValue(mockUser);
         jest.spyOn(categoryRepo, 'findOne').mockResolvedValue(null);
         jest.spyOn(categoryRepo, 'save').mockResolvedValue(mockCategory);

         const response = await service.create('validToken', {
            name: 'New Category',
         } as CreateCategoryDto);

         expect(response).toEqual(
            new CREATED({
               message: 'Create new category successfully',
               metadata: { result: mockCategory },
            }),
         );
      });

      it('should handle error during category creation', async () => {
         const mockUser = {
            username: 'testuser',
            password: 'password123',
            email: 'testuser@example.com',
         } as unknown as AccountEntity;
         jest.spyOn(courseService, 'findAccountByToken').mockResolvedValue(mockUser);
         jest.spyOn(categoryRepo, 'findOne').mockResolvedValue(null);
         jest.spyOn(categoryRepo, 'save').mockRejectedValue(new Error('Database error'));

         try {
            await service.create('validToken', { name: 'New Category' } as CreateCategoryDto);
         } catch (error) {
            expect(error).toEqual(
               new HttpExceptionFilter({
                  message: 'Create new category have error',
                  error: new Error('Database error'),
               }),
            );
         }
      });
   });
});
