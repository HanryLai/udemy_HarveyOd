import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerMiddleware } from './middlewares/Logger.middleware';
import { PostgresDatabaseModule } from './common/databases/postgres/data.module';
import { AuthModule } from './apps/auth/auth.module';
import { CourseModule } from './apps/course/course.module';

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

      PostgresDatabaseModule,
      AuthModule,
      CourseModule,
   ],
   controllers: [],
   providers: [],
})
export class AppModule implements NestModule {
   configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleware).forRoutes('*');
   }
}
