import {
   Controller,
   Post,
   Body,
   HttpCode,
   HttpStatus,
   UseGuards,
   UseInterceptors,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExistToken } from 'src/common/guards/exist-token.guard';
import { MessageResponse } from 'src/common';
import { TokenCurrent } from 'src/common/decorators/token.decorator';
import { RequestInterceptor } from 'src/common/interceptors/token-current.interceptor';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
   constructor(private readonly courseService: CourseService) {}

   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @HttpCode(HttpStatus.OK)
   @Post('create')
   @ApiOperation({ summary: 'Create new course' })
   @ApiOkResponse({ description: 'Create new course successfully' })
   @ApiBody({ type: CreateCourseDto, description: 'About information of course' })
   public async createCourse(
      @Body() createCourseDto: CreateCourseDto,
      @TokenCurrent() token: string,
   ): Promise<MessageResponse> {
      return await this.courseService.create(createCourseDto, token);
   }
}
