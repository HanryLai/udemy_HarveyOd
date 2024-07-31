import {
   Body,
   Controller,
   Get,
   Param,
   Post,
   Put,
   Query,
   UseGuards,
   UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExistToken, MessageResponse, RequestInterceptor, TokenCurrent } from 'src/common';
import { CategoryCourseDto, CreateCategoryDto } from '../category/dto';
import { CourseService } from './course.service';
import { CreateCourseDto, TagsCourseDto, UpdateCourseDto } from './dto/';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
   constructor(private readonly courseService: CourseService) {}

   //GET
   @Get('/course/:course_id')
   @ApiOperation({ summary: 'Get course by id' })
   @ApiFoundResponse({ description: 'Found this course' })
   @ApiBody({ type: CreateCourseDto, description: 'About information of course' })
   public async getCourseById(@Param('course_id') id: string): Promise<MessageResponse> {
      return await this.courseService.findCourseById(id);
   }

   //GET
   @Get('/categories/:course_id')
   @ApiOperation({ summary: 'Get list categories of course' })
   @ApiFoundResponse({ description: 'Found list categories' })
   @ApiBody({ type: CreateCategoryDto, description: 'About information of category' })
   public async getCategoryOfCourse(@Param('course_id') id: string): Promise<MessageResponse> {
      return await this.courseService.findCategoryOfCourse(id);
   }
   //GET
   @Get('')
   @ApiOperation({ summary: 'Get courses' })
   @ApiFoundResponse({ description: 'Found  courses' })
   @ApiBody({ type: CreateCourseDto, description: 'About information of course' })
   public async getCourseByOffSet(@Query('page') offset: number): Promise<MessageResponse> {
      return await this.courseService.findByOffSet(offset);
   }

   // POST
   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @Post('create')
   @ApiOperation({ summary: 'Create new course' })
   @ApiOkResponse({ description: 'Create new course successfully' })
   @ApiBody({
      type: CreateCourseDto,
      description: 'About information of course',
   })
   public async createCourse(
      @Body() createCourseDto: CreateCourseDto,
      @TokenCurrent() token: string,
   ): Promise<MessageResponse> {
      return await this.courseService.create(createCourseDto, token);
   }

   //PUT
   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @Put('course/categories')
   @ApiOperation({ summary: 'Create new course category relationship' })
   @ApiOkResponse({ description: 'Create new course category relationship successfully' })
   @ApiBody({
      type: CategoryCourseDto,
      description: 'About information of course category relationship ',
   })
   public async UpdateCourseCategory(
      @Body() categoryCourse: CategoryCourseDto,
      @TokenCurrent() token: string,
   ): Promise<MessageResponse> {
      return await this.courseService.updateCourseCategories(categoryCourse, token);
   }

   //PUT
   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @Put('course/update/:id')
   @ApiOperation({ summary: 'Update course' })
   @ApiOkResponse({ description: 'Update course successfully' })
   @ApiBody({
      type: UpdateCourseDto,
      description: 'About information of course ',
   })
   public async UpdateCourse(
      @Body() updateCourse: UpdateCourseDto,
      @Param('id') id: string,
      @TokenCurrent() token: string,
   ): Promise<MessageResponse> {
      return await this.courseService.updateCourse(updateCourse, id, token);
   }

   //PUT
   @Put('course/tags')
   @ApiOperation({ summary: 'Add tags to course' })
   @ApiOkResponse({ description: 'Add tags to course successfully' })
   @ApiBody({
      type: 'object',
      schema: {
         properties: {
            courseId: {
               type: 'string',
               example: 'b76591d8-dc2a-48ac-ab41-325ffd6336fe',
               description: 'Id of course need add list tag',
            },
            tagIds: {
               type: 'array',
               items: { type: 'string' },
               description: 'List ids of tag associated with the course',
               example: [
                  'dd8893b9-660c-4519-9285-c5b0d0e60063',
                  'd0b59625-5af0-4b3f-9bcf-69313989fcc9',
               ],
            },
         },
      },
   })
   public async updateCourseTags(@Body() body: TagsCourseDto): Promise<MessageResponse> {
      return await this.courseService.updateCourseTags(body.courseId, body.tagIds);
   }
}
