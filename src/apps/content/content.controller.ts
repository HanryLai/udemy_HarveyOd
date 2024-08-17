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
   Put,
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
import { object } from 'joi';

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
   @Get('content/owner/:id')
   @ApiOperation({ summary: 'Get content owner by id' })
   @ApiFoundResponse({ description: 'Found this content owner' })
   @ApiBody({ type: CreateContentDto, description: 'About information of course' })
   async findOwnerById(@Param('id') id: string, @TokenCurrent() token: string) {
      return this.contentService.findOwnerById(id, token);
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

   @UseGuards(ExistToken)
   @UseInterceptors(RequestInterceptor)
   @Put('content/update/:id')
   @ApiOperation({ summary: 'Update content by id' })
   @ApiOkResponse({ description: 'Updated content' })
   @ApiBody({ type: UpdateContentDto, description: 'About information of content' })
   async update(
      @Param('id') id: string,
      @TokenCurrent() token: string,
      @Body() updateContentDto: UpdateContentDto,
   ) {
      return this.contentService.updateById(id, updateContentDto, token);
   }

   @UseGuards(ExistToken)
   @UseInterceptors(RequestInterceptor)
   @Patch('content/order-index/:id')
   @ApiOperation({ summary: 'Update order_index of content by id' })
   @ApiOkResponse({ description: 'Updated order index content' })
   @ApiBody({
      schema: {
         type: 'object',
         properties: {
            orderIndex: {
               type: 'number',
               example: 2,
               description: 'New order index of this content',
            },
         },
      },
      description: 'About information of body api',
   })
   async updateOrderIndex(
      @Param('id') id: string,
      @TokenCurrent() token: string,
      @Body()
      updateContentDto: {
         orderIndex: number;
      },
   ) {
      return this.contentService.updateContentOrderIndex(id, updateContentDto.orderIndex, token);
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
