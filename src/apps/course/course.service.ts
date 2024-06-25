import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseRepository } from 'src/repositories/courses';
import { EntityManager } from 'typeorm';
import { Request, Response } from 'express';

@Injectable()
export class CourseService {
   constructor(
      private courseRepo: CourseRepository,
      private entityManager: EntityManager,
   ) {}
   public async create(
      createCourseDto: CreateCourseDto,
      req: Request,
      res: Response,
   ): Promise<Response> {
      try {
         return res.json();
      } catch (error) {
         throw error;
      }
   }
}
