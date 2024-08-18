import { Inject, Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseLessonEntity } from 'src/entities/courses';
import { CourseModuleRepository } from 'src/repositories/courses';
import { EntityManager } from 'typeorm';
import { CourseService } from '../course/course.service';

@Injectable()
export class LessonService {
   constructor(
      @InjectRepository(CourseLessonEntity) lessonRepo: CourseModuleRepository,
      @Inject() CourseService: CourseService,
      private entityManager: EntityManager,
   ) {}
}
