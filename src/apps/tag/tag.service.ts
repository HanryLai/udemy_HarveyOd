import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from 'src/entities/courses';
import { TagRepository } from 'src/repositories/courses';
import { MessageResponse } from 'src/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class TagService {
   constructor(
      @InjectRepository(TagEntity) tagRepo: TagRepository,
      private readonly entityManager: EntityManager,
   ) {}

   //  public async createCategory(createCategoryDto: CreateTagDto): Promise<MessageResponse> {
   //     try {
   //     } catch (error) {}
   //  }
}
