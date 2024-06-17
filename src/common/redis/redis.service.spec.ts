import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import Redis from 'ioredis-mock'; 
describe('RedisService', () => {
   let service: RedisService;
   let client: Redis;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [RedisService],
      }).compile();

      service = module.get<RedisService>(RedisService);
      client = new Redis(); // Initialize mock Redis client
      service['client'] = client; // Replace actual client with mock client
   });

   it('should be defined', () => {
      expect(service).toBeDefined();
   });

   it('should set value', async () => {
      const setSpy = jest.spyOn(client, 'set');
      await service.set('key', 'value', 1000);
      expect(setSpy).toHaveBeenCalledWith('key', '"value"', 'EX', 1000);
   });

   it('should get value', async () => {
      await client.set('key', '"value"');
      const value = await service.get<string>('key');
      expect(value).toEqual('value');
   });

   it('should get ttl', async () => {
      await client.set('key', '"value"', 'EX', 1000);
      const ttl = await service.ttl('key');
      expect(ttl).toBeGreaterThan(0);
   });
});
