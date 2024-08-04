import { Body, Controller, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExistToken, MessageResponse, RequestInterceptor, TokenCurrent } from 'src/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { ModuleService } from './module.service';

@ApiTags('modules')
@Controller('modules')
export class ModuleController {
   constructor(private readonly moduleService: ModuleService) {}

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
}
