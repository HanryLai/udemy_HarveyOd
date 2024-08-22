import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import {
   ApiBody,
   ApiConsumes,
   ApiCreatedResponse,
   ApiOperation,
   ApiResponse,
   ApiTags,
} from '@nestjs/swagger';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CourseContentEntity, CourseLessonEntity } from 'src/entities/courses';
import { ExistToken, MessageResponse, RequestInterceptor, TokenCurrent } from 'src/common';

@ApiTags('lessons')
@Controller('lessons')
export class LessonController {
   constructor(private readonly lessonService: LessonService) {}

   @Get('lesson/:id_lesson')
   @ApiOperation({ summary: 'Find lesson by id' })
   @ApiResponse({ status: '2XX', description: 'Find lesson by id successfully' })
   @ApiResponse({ status: '4XX', description: 'Find lesson by id not found' })
   public async findById(@Param('id_lesson') id_lesson: string): Promise<MessageResponse> {
      return this.lessonService.findById(id_lesson);
   }

   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @Get('owner/lesson/:id_lesson')
   @ApiOperation({ summary: 'Find lesson by id' })
   @ApiResponse({ status: '2XX', description: 'Find lesson by id successfully' })
   @ApiResponse({ status: '4XX', description: 'Find lesson by id not found' })
   public async ownerFindById(
      @Param('id_lesson') id_lesson: string,
      @TokenCurrent() token: string,
   ): Promise<MessageResponse> {
      return this.lessonService.ownerFindById(id_lesson, token);
   }

   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @Post('create/:id_module')
   @ApiOperation({ summary: 'Create new lesson of module' })
   @ApiResponse({ status: 409, description: 'Duplicate title of module' })
   @ApiResponse({ status: 201, description: 'Create new lesson of module successfully' })
   @ApiCreatedResponse({ description: 'Lesson created', type: CourseLessonEntity })
   @ApiBody({
      type: CreateLessonDto,
      description: 'About information lesson schema',
   })
   public async create(
      @Param('id_module') id_module: string,
      @Body() createLessonDto: CreateLessonDto,
      @TokenCurrent() token: string,
   ) {
      console.log(createLessonDto);
      return this.lessonService.create(id_module, createLessonDto, token);
   }
}
