import {
   Controller,
   Post,
   Body,
   HttpCode,
   HttpStatus,
   UseGuards,
   UseInterceptors,
   Headers,
   Get,
   Param,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import {
   ApiBody,
   ApiFoundResponse,
   ApiOkResponse,
   ApiOperation,
   ApiTags,
} from '@nestjs/swagger';
import { ExistToken } from 'src/common/guards/exist-token.guard';
import { MessageResponse } from 'src/common';
import { TokenCurrent } from 'src/common/decorators/token.decorator';
import { RequestInterceptor } from 'src/common/interceptors/token-current.interceptor';
import { CourseEntity } from 'src/entities/courses';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
   constructor(private readonly courseService: CourseService) {}

   @HttpCode(HttpStatus.FOUND)
   @Get('/course/:course_id')
   @ApiOperation({ summary: 'Get course by id' })
   @ApiFoundResponse({ description: 'Found this course' })
   @ApiBody({ type: [CourseEntity] }) // type not clear
   public async getCourseById(
      @Param('course_id') id: string,
   ): Promise<MessageResponse> {
      return await this.courseService.findCourseById(id);
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
}
