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
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import {
   ApiBody,
   ApiCreatedResponse,
   ApiFoundResponse,
   ApiOkResponse,
   ApiOperation,
   ApiTags,
} from '@nestjs/swagger';
import { ExistToken, RequestInterceptor, TokenCurrent } from 'src/common';

@ApiTags('contents')
@Controller('contents')
export class ContentController {
   constructor(private readonly contentService: ContentService) {}

   @Get('content/:id')
   @ApiOperation({ summary: 'Get content by id' })
   @ApiFoundResponse({ description: 'Found this content' })
   @ApiBody({ type: CreateContentDto, description: 'About information of course' })
   async findById(@Param('id') id: string) {
      return this.contentService.findById(id);
   }

   @UseGuards(ExistToken)
   @UseInterceptors(RequestInterceptor)
   @Post('create/:idCourse')
   @ApiOperation({ summary: 'Create new content' })
   @ApiCreatedResponse({ description: 'Created new content' })
   @ApiBody({ type: CreateContentDto, description: 'About information of content' })
   async create(
      @Body() createContentDto: CreateContentDto,
      @Param('idCourse') idCourse: string,
      @TokenCurrent() token: string,
   ) {
      return this.contentService.create(idCourse, createContentDto, token);
   }

   @Patch('content/update/:id')
   @ApiOperation({ summary: 'Update content by id' })
   @ApiOkResponse({ description: 'Updated content' })
   @ApiBody({ type: UpdateContentDto, description: 'About information of content' })
   async update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto) {
      return this.contentService.updateById(id, updateContentDto);
   }

   @Delete(':id')
   @ApiOperation({ summary: 'Delete content by id' })
   @ApiOkResponse({ description: 'Deleted content' })
   async remove(@Param('id') id: string) {
      return this.contentService.deleteContent(id);
   }

   // updateContentOrderIndex
   @UseInterceptors(RequestInterceptor)
   @UseGuards(ExistToken)
   @Patch('content/order/:id')
   @ApiOperation({ summary: 'Update content order index' })
   @ApiOkResponse({ description: 'Updated content order index' })
   @ApiBody({ type: UpdateContentDto, description: 'About information of content' })
   async updateContentOrderIndex(
      @Param('id') id: string,
      @Body() updateOrder: { newIndex: number },
      @TokenCurrent() token: string,
   ) {
      return this.contentService.updateContentOrderIndex(id, updateOrder.newIndex, token);
   }
}
