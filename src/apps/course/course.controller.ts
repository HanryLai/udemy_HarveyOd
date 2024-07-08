import {
   Controller,
   Post,
   Body,
   HttpCode,
   HttpStatus,
   UseGuards,
   UseInterceptors,
   Get,
   Param,
   Query,
   ParseIntPipe,
   Put,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/';
import { ApiBody, ApiFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TokenCurrent, RequestInterceptor, ExistToken, MessageResponse } from 'src/common';
import { CategoryCourseDto } from '../category/dto';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
   constructor(private readonly courseService: CourseService) {}

   @HttpCode(HttpStatus.FOUND)
   @Get('/course/:course_id')
   @ApiOperation({ summary: 'Get course by id' })
   @ApiFoundResponse({ description: 'Found this course' })
   @ApiBody({ type: CreateCourseDto, description: 'About information of course' })
   public async getCourseById(@Param('course_id') id: string): Promise<MessageResponse> {
      return await this.courseService.findCourseById(id);
   }

   @HttpCode(HttpStatus.FOUND)
   @Get('')
   @ApiOperation({ summary: 'Get course by id' })
   @ApiFoundResponse({ description: 'Found this course' })
   @ApiBody({ type: CreateCourseDto, description: 'About information of course' })
   public async getCourseByOffSet(
      @Query('offset', ParseIntPipe) offset: number,
   ): Promise<MessageResponse> {
      return await this.courseService.findByOffSet(offset);
   }

   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @HttpCode(HttpStatus.OK)
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

   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @HttpCode(HttpStatus.OK)
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
      return await this.courseService.updateCourseCategory(categoryCourse, token);
   }

   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @HttpCode(HttpStatus.OK)
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
}
