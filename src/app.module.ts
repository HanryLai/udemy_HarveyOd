import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerMiddleware } from './middlewares';
import { PostgresDatabaseModule } from './common';
import { AuthModule } from './apps/auth/auth.module';
import { CourseModule } from './apps/course/course.module';
import { CategoryModule } from './apps/category/category.module';
import { TagModule } from './apps/tag/tag.module';
import { ModuleModule } from './apps/module/module.module';
import { ThrottlerModule } from '@nestjs/throttler';

import { LoggersModule } from './loggers/loggers.module';
import { BullModule } from '@nestjs/bull';
import { ContentModule } from './apps/content/content.module';

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
         validationSchema: Joi.object({
            NODE_ENV: Joi.string()
               .valid('development', 'production', 'test', 'provision')
               .default('development'),
            PORT: Joi.number().port().default(3000),
         }),
         validationOptions: {
            allowUnknown: true,
            abortEarly: true,
         },
      }),
      ThrottlerModule.forRoot([
         {
            ttl: 60 * 60,
            limit: 1000,
         },
      ]),
      BullModule.forRootAsync({
         useFactory: (configService: ConfigService) => ({
            redis: {
               host: configService.get('REDIS_HOST'),
               port: configService.get('REDIS_PORT'),
            },
         }),
         inject: [ConfigService],
      }),

      PostgresDatabaseModule,
      AuthModule,
      CourseModule,
      CategoryModule,
      TagModule,
      ModuleModule,
      LoggersModule,
      ContentModule,
   ],
   controllers: [],
   providers: [
      {
         provide: 'APP_GUARD',
         useClass: ThrottlerModule,
      },
   ],
})
export class AppModule implements NestModule {
   configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleware).forRoutes('*');
   }
}
