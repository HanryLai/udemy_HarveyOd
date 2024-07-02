import {
   Controller,
   Get,
   Post,
   Body,
   Patch,
   Param,
   Delete,
   HttpStatus,
   HttpCode,
   Headers,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MessageResponse } from 'src/common';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
   constructor(private readonly categoryService: CategoryService) {}

   @HttpCode(HttpStatus.OK)
   @Post('/create')
   public async createCategory(
      @Body() category: CreateCategoryDto,
      @Headers('authorization') authToken: string,
   ): Promise<MessageResponse> {
      console.log(category);
      return await this.categoryService.create(authToken, category);
   }
}
