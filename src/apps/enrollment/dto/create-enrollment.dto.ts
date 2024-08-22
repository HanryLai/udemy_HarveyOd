import { AccountEntity } from 'src/entities/accounts';
import { CourseEntity, EnrollmentEntity } from 'src/entities/courses';

export class CreateEnrollmentDto {
   enrollmentDate: Date;
   id_account: AccountEntity;
   id_course: CourseEntity;
}
