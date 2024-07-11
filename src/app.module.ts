import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerMiddleware } from './middlewares/Logger.middleware';
import { PostgresDatabaseModule } from './common/databases/postgres/data.module';
import { AuthModule } from './apps/auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';

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

      PostgresDatabaseModule,
      AuthModule,
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
