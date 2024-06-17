import { ConfigService } from '@nestjs/config';
// import { entities } from 'src/entities';
import { DataSource } from 'typeorm';

const configService = new ConfigService();

export default new DataSource({
   type: 'postgres',
   host: configService.getOrThrow('POSTGRES_HOST'),
   port: configService.getOrThrow('POSTGRES_PORT'),
   username: configService.getOrThrow('POSTGRES_USER'),
   password: configService.getOrThrow('POSTGRES_PASSWORD'),
   database: configService.getOrThrow('POSTGRES_DB'),
   synchronize: true,
   // entities: [...entities],
   migrations: ['migrations/**'],
});
