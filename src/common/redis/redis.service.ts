import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
   private client: Redis;

   async onModuleInit() {
      this.client = new Redis({
         host: process.env.REDIS_HOST || 'localhost',
         port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
         retryStrategy: (times) => Math.max(times * 100, 3000),
      });
   }

   async onModuleDestroy() {
      await this.client.quit();
   }

   async set(key: string, value: any, ttl: number): Promise<void> {
      await this.client.set(key, JSON.stringify(value), 'EX', ttl);
   }

   async get<T>(key: string): Promise<T | null> {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
   }

   async ttl(key: string): Promise<number> {
      return this.client.ttl(key);
   }
   
   async delete(key: string): Promise<void> {
      await this.client.del(key);
   }
}
