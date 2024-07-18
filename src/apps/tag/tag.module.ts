import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from 'src/entities/courses';

@Module({
   imports: [TypeOrmModule.forFeature([TagEntity])],
   controllers: [TagController],
   providers: [TagService],
})
export class TagModule {}
