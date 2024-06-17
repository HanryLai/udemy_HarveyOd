import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from 'src/entities/entity.providers';

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
         validationSchema: Joi.object({
            POSTGRES_HOST: Joi.string().required(),
            POSTGRES_PORT: Joi.number().port().required(),
            POSTGRES_USER: Joi.string().required(),
            POSTGRES_PASSWORD: Joi.string().required(),
            POSTGRES_DB: Joi.string().required(),
         }),
      }),
      TypeOrmModule.forRootAsync({
         useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.getOrThrow('POSTGRES_HOST'),
            port: configService.getOrThrow('POSTGRES_PORT'),
            username: configService.getOrThrow('POSTGRES_USER'),
            password: configService.getOrThrow('POSTGRES_PASSWORD'),
            database: configService.getOrThrow('POSTGRES_DB'),
            autoLoadEntities: true,
            synchronize: true,
            entities: entities,
         }),
         inject: [ConfigService],
      }),
   ],
   providers: [],
   exports: [],
})
export class PostgresDatabaseModule {}
