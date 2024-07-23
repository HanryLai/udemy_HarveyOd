import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from 'src/repositories/courses';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryEntity, CertificateEntity, CourseEntity } from 'src/entities/courses';
import { createQueryBuilder, EntityManager } from 'typeorm';
import { CourseService } from '../course/course.service';
import { CREATED, ErrorResponse, HttpExceptionFilter, MessageResponse, OK } from 'src/common';
import { HttpStatus } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { AccountEntity } from 'src/entities/accounts';
import { RedisService } from 'src/common/redis/redis.service';

describe('Category Service', () => {
   let service: CategoryService;
   let categoryRepo: CategoryRepository;
   let entityManager: Partial<EntityManager>;
   let courseService: CourseService;
   let redisService: RedisService;

   const entityManagerMock = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({
         affected: 1,
         raw: [{ id: '1', name: 'Updated Category', description: 'Updated description' }],
      }),
   };

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
               useValue: entityManagerMock,
            },
            {
               provide: CourseService,
               useValue: {
                  findAccountByToken: jest.fn(),
               },
            },
            {
               provide: RedisService,
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
      it('Should return id category not valid', async () => {
         const result = await service.findById('   ');
         expect(result).toEqual(
            new ErrorResponse({
               message: 'Id not valid',
               statusCode: HttpStatus.BAD_REQUEST,
               metadata: {},
            }),
         );
      });

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
                  ...foundCategory,
               },
            }),
         );
         expect(categoryRepo.findOne).toHaveBeenCalledWith({
            select: ['id', 'name', 'description'],
            where: { id: idCategory },
         });
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
         expect(categoryRepo.findOne).toHaveBeenCalledWith({
            select: ['id', 'name', 'description'],
            where: { id: idCategory },
         });
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

         expect(categoryRepo.findOne).toHaveBeenCalledWith({
            select: ['id', 'name', 'description'],
            where: { id: idCategory },
         });
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

         jest.spyOn(categoryRepo, 'find').mockResolvedValue(foundCategory);

         const result = await service.findAll();

         expect(result).toEqual({
            message: 'Found list category successfully',
            metadata: foundCategory,
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
               metadata: mockCategory,
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

   describe('UpdateCategory', () => {
      it('should update category successfully', async () => {
         const id = '1';
         const updateCategoryDto: UpdateCategoryDto = {
            name: 'Updated Category',
            description: 'Updated description',
         };

         const result = await service.updateCategory(id, updateCategoryDto);

         expect(result).toBeInstanceOf(OK);
         expect(result.message).toEqual('update category successfully');
         expect(result.metadata.id).toEqual('1');
         expect(result.metadata.name).toEqual('Updated Category');
         expect(result.metadata.description).toEqual('Updated description');

         expect(entityManagerMock.createQueryBuilder).toHaveBeenCalled();
         expect(entityManagerMock.update).toHaveBeenCalled();
         expect(entityManagerMock.set).toHaveBeenCalledWith({
            name: updateCategoryDto.name,
            description: updateCategoryDto.description,
         });
         expect(entityManagerMock.where).toHaveBeenCalledWith('id = :id', { id });
         expect(entityManagerMock.returning).toHaveBeenCalledWith(['id', 'name', 'description']);
         expect(entityManagerMock.execute).toHaveBeenCalled();
      });

      it('should return error response if no category is updated', async () => {
         entityManagerMock.execute.mockResolvedValue({ affected: 0 });

         const id = '1';
         const updateCategoryDto: UpdateCategoryDto = {
            name: 'Updated Category',
            description: 'Updated description',
         };

         const result = await service.updateCategory(id, updateCategoryDto);

         expect(result).toBeInstanceOf(ErrorResponse);
         expect(result.message).toEqual('update category failed');
         expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);
         expect(result.metadata).toEqual({});

         expect(entityManagerMock.createQueryBuilder).toHaveBeenCalled();
         expect(entityManagerMock.update).toHaveBeenCalled();
         expect(entityManagerMock.set).toHaveBeenCalledWith({
            name: updateCategoryDto.name,
            description: updateCategoryDto.description,
         });
         expect(entityManagerMock.where).toHaveBeenCalledWith('id = :id', { id });
         expect(entityManagerMock.returning).toHaveBeenCalledWith(['id', 'name', 'description']);
         expect(entityManagerMock.execute).toHaveBeenCalled();
      });

      it('should throw HttpExceptionFilter if an error occurs during update', async () => {
         const id = '1';
         const updateCategoryDto: UpdateCategoryDto = {
            name: 'Updated Category',
            description: 'Updated description',
         };

         entityManagerMock.execute.mockRejectedValue(new Error('Database error'));

         try {
            await service.updateCategory(id, updateCategoryDto);
         } catch (error) {
            expect(error).toBeInstanceOf(HttpExceptionFilter);
            expect(error.message).toEqual('update category failed');
            expect(error.error.message).toEqual('Database error');
         }

         // Kiểm tra các phương thức đã được gọi với đúng tham số
         expect(entityManagerMock.createQueryBuilder).toHaveBeenCalled();
         expect(entityManagerMock.update).toHaveBeenCalled();
         expect(entityManagerMock.set).toHaveBeenCalledWith({
            name: updateCategoryDto.name,
            description: updateCategoryDto.description,
         });
         expect(entityManagerMock.where).toHaveBeenCalledWith('id = :id', { id });
         expect(entityManagerMock.returning).toHaveBeenCalledWith(['id', 'name', 'description']);
         expect(entityManagerMock.execute).toHaveBeenCalled();
      });
   });

   describe('getListCategories', () => {
      it('should return list of categories', async () => {
         jest.spyOn(service, 'findById').mockImplementation(async (id: string) => {
            if (id === '1') {
               const category = new CategoryEntity({
                  id: '1',
                  name: 'Category 1',
                  description: 'Description of Category 1',
                  createAt: new Date(),
                  updateAt: new Date(),
                  isActive: true,
                  isArchived: false,
                  createBy: 'Admin',
               });
               return new OK({
                  message: 'Found category',
                  metadata: {
                     ...category,
                  },
               });
            } else if (id === '2') {
               const category = new CategoryEntity({
                  id: '2',
                  name: 'Category 2',
                  description: 'Description of Category 2',
                  createAt: new Date(),
                  updateAt: new Date(),
                  isActive: true,
                  isArchived: false,
                  createBy: 'Admin',
               });
               return new OK({
                  message: 'Found category',
                  metadata: {
                     ...category,
                  },
               });
            }
         });

         const listCategoryIds = ['1', '2'];

         const result = (await service.getListCategory(listCategoryIds)) as CategoryEntity[];
         expect(result).toHaveLength(listCategoryIds.length);
         result.forEach((category, index) => {
            console.log('category+' + category.id);
            expect(category.id).toBe(listCategoryIds[index]);
            expect(category.name).toBe(`Category ${listCategoryIds[index]}`);
            expect(category.description).toBe(`Description of Category ${listCategoryIds[index]}`);
         });
      });

      it('Should return ErrorResponse one element cannot found', async () => {
         jest
            .spyOn(service, 'findById')
            .mockImplementation(async (id: string): Promise<MessageResponse> => {
               if (id === '2')
                  return new ErrorResponse({
                     message: 'Some thing error',
                     statusCode: 404,
                     metadata: new Error(),
                  });
               else if (id === '3')
                  return new OK({
                     message: 'Found category',
                     metadata: {
                        category: new CategoryEntity({
                           id: '1',
                           name: 'Category 1',
                           description: 'Description of Category 1',
                           createAt: new Date(),
                           updateAt: new Date(),
                           isActive: true,
                           isArchived: false,
                           createBy: 'Admin',
                        }),
                     },
                  });
            });
         const listCategoryIds = ['2', '3'];
         const result = (await service.getListCategory(listCategoryIds)) as ErrorResponse;
         expect(result).toBeInstanceOf(Error);
         expect(result.message).toBe('Cannot found one element category in list category');
         expect(result.statusCode).toBe(404);
      });

      it('Should return ErrorResponse listcategoryIds cannot null or empty', async () => {
         const result = (await service.getListCategory([])) as ErrorResponse;
         expect(result).toBeInstanceOf(Error);
         expect(result.message).toBe('List categories id cannot null');
         expect(result.statusCode).toBe(400);
      });

      it('Should throw HttpExceptionFilter', async () => {
         const err = new HttpExceptionFilter({
            message: 'Get list categories failed',
            error: new Error(),
         });
         jest.spyOn(service, 'getListCategory').mockRejectedValue(err);
         try {
            await service.getListCategory(['3']);
         } catch (err) {
            expect(err).toBeInstanceOf(HttpExceptionFilter);
            expect(err.message).toBe('Get list categories failed');
         }
      });
   });
});
