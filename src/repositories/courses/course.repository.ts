import { CourseEntity } from 'src/entities/courses';
import { BaseRepository } from '../base';
import { CourseType } from 'src/constants';
import { EntityManager, EntityTarget, In, Repository } from 'typeorm';
import { HttpExceptionFilter } from 'src/common';

export class CourseRepository extends Repository<CourseEntity> {
   public async findCourseByIdRepo(id: string): Promise<CourseEntity> {
      try {
         const queryType = [CourseType.PUBLISH, CourseType.UPCOMING];
         //find on database
         const foundCourse = await this.findOne({
            where: {
               id: id,
               type: In(queryType),
            },
            select: [
               'id',
               'title',
               'description',
               'language',
               'price',
               'discount',
               'instructor',
               'level',
               'thunbnailUrl',
               'type',
            ],
            relations: ['account'],
         });

         return foundCourse;
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'find course failed',
            error: error,
         });
      }
   }
}
