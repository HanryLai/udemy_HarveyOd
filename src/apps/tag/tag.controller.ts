import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MessageResponse } from 'src/common';
import { CreateTagDto, UpdateTagDto } from './dto';
import { TagService } from './tag.service';

@ApiTags('Tag')
@Controller('tags')
export class TagController {
   constructor(private readonly tagService: TagService) {}

   @Get('tag/:id')
   @ApiOperation({ summary: 'Find tag by id tag' })
   @ApiFoundResponse({
      description: 'Find tag by id tag successfully',
   })
   @ApiBody({ type: CreateTagDto, description: 'About schema tag' })
   public async findById(@Param('id') id: string): Promise<MessageResponse> {
      return await this.tagService.findById(id);
   }

   @Get('search')
   @ApiOperation({ summary: 'Find tag by name tag' })
   @ApiFoundResponse({
      description: 'Find tag by name tag successfully',
   })
   @ApiBody({ type: CreateTagDto, description: 'About schema tag' })
   public async findByName(@Query('name') name: string): Promise<MessageResponse> {
      console.log('name');
      console.log(name);
      return await this.tagService.SearchName(name);
   }

   @Get('')
   @ApiOperation({ summary: 'Find list tags category' })
   @ApiFoundResponse({
      description: 'Find list tags successfully',
   })
   @ApiBody({ type: CreateTagDto, description: 'About schema tag' })
   public async findAll(@Query('page') page: number): Promise<MessageResponse> {
      return await this.tagService.findAll(page);
   }

   @Post('/create')
   @ApiOperation({ summary: 'Create new tag' })
   @ApiOkResponse({ description: 'Create new tag successfully' })
   @ApiBody({ type: CreateTagDto, description: 'About schema tag' })
   public async create(@Body() tag: CreateTagDto): Promise<MessageResponse> {
      return await this.tagService.create(tag);
   }

   @Patch('/update/:id')
   @ApiOperation({ summary: 'Update tag' })
   @ApiOkResponse({ description: 'Update tag successfully' })
   @ApiBody({ type: UpdateTagDto, description: 'About schema tag' })
   public async update(
      @Body() tag: UpdateTagDto,
      @Param('id') id: string,
   ): Promise<MessageResponse> {
      return await this.tagService.update(tag, id);
   }

   @Delete('/delete/:id')
   @ApiOperation({ summary: 'Delete tag' })
   @ApiOkResponse({ description: 'Delete tag successfully' })
   @ApiBody({ type: UpdateTagDto, description: 'About schema tag' })
   public async delete(@Param('id') id: string): Promise<MessageResponse> {
      return await this.tagService.delete(id);
   }
}
