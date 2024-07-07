import {
   Controller,
   Get,
   Post,
   Body,
   Param,
   HttpStatus,
   HttpCode,
   UseGuards,
   UseInterceptors,
   Put,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBody, ApiFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MessageResponse, RequestInterceptor, ExistToken, TokenCurrent } from 'src/common';
import { CreateCourseDto } from '../course/dto/create-course.dto';
import { CategoryCourseDto } from './dto/create-category-course.dto';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
   constructor(private readonly categoryService: CategoryService) {}

   @HttpCode(HttpStatus.FOUND)
   @Get('category/:id')
   @ApiOperation({ summary: 'Find category by id category' })
   @ApiFoundResponse({
      description: 'Find category by id category successfully',
   })
   @ApiBody({ type: CreateCategoryDto, description: 'About scheme category' })
   public async findById(@Param('id') id: string): Promise<MessageResponse> {
      return await this.categoryService.findById(id);
   }

   @HttpCode(HttpStatus.FOUND)
   @Get('')
   @ApiOperation({ summary: 'Find category by id category' })
   @ApiFoundResponse({
      description: 'Find category by id category successfully',
   })
   @ApiBody({ type: CreateCategoryDto, description: 'About scheme category' })
   public async findAll(): Promise<MessageResponse> {
      return await this.categoryService.findAll();
   }

   @HttpCode(HttpStatus.OK)
   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @Post('/create')
   @ApiOperation({ summary: 'Create new category' })
   @ApiOkResponse({ description: 'Create new category successfully' })
   @ApiBody({ type: CreateCourseDto, description: 'About schema category' })
   public async create(
      @Body() category: CreateCategoryDto,
      @TokenCurrent() authToken: string,
   ): Promise<MessageResponse> {
      return await this.categoryService.create(authToken, category);
   }

   @HttpCode(HttpStatus.OK)
   @Put('category/:id')
   @ApiOperation({ summary: 'Find category by id category' })
   @ApiFoundResponse({
      description: 'Find category by id category successfully',
   })
   @ApiBody({ type: UpdateCategoryDto, description: 'About scheme category' })
   public async update(
      @Body() category: UpdateCategoryDto,
      @Param('id') id: string,
   ): Promise<MessageResponse> {
      return await this.categoryService.updateCategory(id, category);
   }

   @HttpCode(HttpStatus.OK)
   @Post('category/course')
   @ApiOperation({ summary: 'Create category_course' })
   @ApiFoundResponse({
      description: 'Create relationship category_course',
   })
   @ApiBody({ type: CategoryCourseDto, description: 'About scheme category' })
   public async AddToCourse(@Body() categoryCourse: CategoryCourseDto): Promise<MessageResponse> {
      return await this.categoryService.addToCourse(categoryCourse);
   }
}
