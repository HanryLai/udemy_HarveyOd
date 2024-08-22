import {
   Body,
   Controller,
   Get,
   Param,
   Patch,
   Post,
   Put,
   UseGuards,
   UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExistToken, MessageResponse, RequestInterceptor, TokenCurrent } from 'src/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { ModuleService } from './module.service';
import { UpdateModuleDto } from './dto';
import { CourseLessonEntity } from 'src/entities/courses';

@ApiTags('modules')
@Controller('modules')
export class ModuleController {
   constructor(private readonly moduleService: ModuleService) {}

   @Get('module/:id_module')
   @ApiOperation({ summary: 'Find module by id' })
   @ApiOkResponse({ description: 'Find module by id successfully' })
   @ApiBody({ type: CreateModuleDto, description: 'Describe schema module' })
   public async findByModuleId(@Param('id_module') id_Module: string): Promise<MessageResponse> {
      return this.moduleService.findModuleById(id_Module);
   }

   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @Get('/owner/module/:id_module')
   @ApiOperation({ summary: 'Find module by id of owner' })
   @ApiOkResponse({ description: 'Find module by id of owner successfully' })
   @ApiBody({ type: CreateModuleDto, description: 'Describe schema module' })
   public async findOwnerModuleById(
      @Param('id_module') id_Module: string,
      @TokenCurrent() token: string,
   ): Promise<MessageResponse> {
      return this.moduleService.findOwnerModuleById(id_Module, token);
   }

   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @Post('create/:id_course')
   @ApiOperation({ summary: 'Create new module' })
   @ApiOkResponse({ description: 'Create new module successfully' })
   @ApiBody({ type: CreateModuleDto, description: 'Describe schema create module' })
   public async create(
      @Body() createModuleDto: CreateModuleDto,
      @Param('id_course') id_Course: string,
      @TokenCurrent() token: string,
   ): Promise<MessageResponse> {
      return this.moduleService.create(createModuleDto, id_Course, token);
   }

   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @Put('update/:id_Module')
   @ApiOperation({ summary: 'Update module' })
   @ApiOkResponse({ description: 'Update module successfully' })
   @ApiBody({ type: UpdateModuleDto, description: 'Describe schema update module' })
   public async updateModule(
      @Body() updateModuleDto: UpdateModuleDto,
      @Param('id_Module') id_Module: string,
      @TokenCurrent() token: string,
   ): Promise<MessageResponse> {
      return this.moduleService.updateModule(updateModuleDto, id_Module, token);
   }

   //updateModuleOrderIndex
   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @Patch('update/order-index/:id_module')
   @ApiOperation({ summary: 'Update module order index' })
   @ApiOkResponse({ description: 'Update module order index successfully' })
   @ApiBody({ type: UpdateModuleDto, description: 'Describe schema update module order index' })
   public async updateModuleOrderIndex(
      @Body() body: { orderIndex: number },
      @Param('id_module') id_Module: string,
      @TokenCurrent() token: string,
   ): Promise<MessageResponse> {
      return this.moduleService.updateModuleOrderIndex(id_Module, body.orderIndex, token);
   }

   //FOR LESSON
   @Get('lessons/:id_module')
   @ApiOperation({ summary: 'Get list lessons of module' })
   @ApiResponse({ status: '2XX', description: '', type: CourseLessonEntity })
   @ApiResponse({ status: '4XX', description: 'Not found this module or lessons of module' })
   public async findAllLessonsOfModule(
      @Param('id_module') id_module: string,
   ): Promise<MessageResponse> {
      return this.moduleService.findAllLessonsOfModule(id_module);
   }
}
