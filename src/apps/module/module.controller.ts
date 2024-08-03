import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessageResponse } from 'src/common';

@ApiTags('modules')
@Controller('modules')
export class ModuleController {
   constructor(private readonly moduleService: ModuleService) {}

   @Post('create/:id_course')
   @ApiOperation({
      summary: 'Create new module',
   })
   @ApiOkResponse({
      description: 'Create new module successfully',
   })
   @ApiBody({ type: CreateModuleDto, description: 'Describe schema create module' })
   public async create(
      @Body() createModuleDto: CreateModuleDto,
      @Param('id_course') id_Course: string,
   ): Promise<MessageResponse> {
      return this.moduleService.create(createModuleDto, id_Course);
   }
}
