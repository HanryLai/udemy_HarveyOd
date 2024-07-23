import {
   Controller,
   Get,
   Post,
   Body,
   Patch,
   Param,
   Delete,
   UseGuards,
   UseInterceptors,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { ApiBody, ApiFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExistToken, MessageResponse, RequestInterceptor, TokenCurrent } from 'src/common';
import { CreateTagDto } from './dto';

@ApiTags('Tag')
@Controller('tags')
export class TagController {
   constructor(private readonly tagService: TagService) {}

   @Get('tag/:id')
   @ApiOperation({ summary: 'Find tag by id category' })
   @ApiFoundResponse({
      description: 'Find tag by id tag successfully',
   })
   public async findById(@Param('id') id: string): Promise<MessageResponse> {
      return await this.tagService.findById(id);
   }

   @Get('')
   @ApiOperation({ summary: 'Find list tags category' })
   @ApiFoundResponse({
      description: 'Find list tags successfully',
   })
   public async findAll(): Promise<MessageResponse> {
      return await this.tagService.findAll();
   }

   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @Post('/create')
   @ApiOperation({ summary: 'Create new tag' })
   @ApiOkResponse({ description: 'Create new tag successfully' })
   @ApiBody({ type: CreateTagDto, description: 'About schema tag' })
   public async create(
      @Body() tag: CreateTagDto,
      @TokenCurrent() authToken: string,
   ): Promise<MessageResponse> {
      return await this.tagService.create(authToken, tag);
   }
}
