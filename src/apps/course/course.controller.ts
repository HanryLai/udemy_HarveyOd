import {
   Controller,
   Get,
   Post,
   Body,
   Patch,
   Param,
   Delete,
   HttpCode,
   HttpStatus,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('course')
export class CourseController {
   constructor(private readonly courseService: CourseService) {}

   @HttpCode(HttpStatus.OK)
   @Post('register')
   @ApiOperation({ summary: 'Create new course' })
   @ApiOkResponse({ description: 'Create new course successfully' })
   @ApiBody({ type: CreateCourseDto, description: 'About information of course' })
   public async createCourse(@Body() CreateCourseDto: CreateCourseDto) {}
}
