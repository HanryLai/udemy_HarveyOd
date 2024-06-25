import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ExistToken } from 'src/common/guards/exist-token.guard';

@Controller('course')
export class CourseController {
   constructor(private readonly courseService: CourseService) {}

   @UseGuards(ExistToken)
   @HttpCode(HttpStatus.OK)
   @Post('register')
   @ApiOperation({ summary: 'Create new course' })
   @ApiOkResponse({ description: 'Create new course successfully' })
   @ApiBody({ type: CreateCourseDto, description: 'About information of course' })
   public async createCourse(
      @Body() createCourseDto: CreateCourseDto,
      @Req() req: Request,
      @Res() res: Response,
   ): Promise<Response> {
      const result = await this.courseService.create(createCourseDto, req, res);
      return res.json(result);
   }
}
