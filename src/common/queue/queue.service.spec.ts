import { Test, TestingModule } from '@nestjs/testing';
import { QueueManager } from './queue.service';
import { BaseQueueService } from './base.queue.service';

// Mock BaseQueueService
class MockBaseQueueService extends BaseQueueService<any> {
   constructor(private mockStatus = { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }) {

      // @ts-ignore
      super();
   }

   async getQueueStatus() {
      return this.mockStatus;
   }

   async pauseQueue() {
   }

   async resumeQueue() {
   }

   async clearQueue() {
   }

   async processJob(): Promise<void> {
   }
}

describe('QueueManager', () => {
   let queueManager: QueueManager;
   let mockQueueService: MockBaseQueueService;
   let mockErrorQueueService: MockBaseQueueService;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [QueueManager],
      }).compile();

      queueManager = module.get<QueueManager>(QueueManager);
      mockQueueService = new MockBaseQueueService();
      mockErrorQueueService = new MockBaseQueueService();

      // Mock error throwing methods
      mockErrorQueueService.pauseQueue = jest.fn().mockRejectedValue(new Error('Pause failed'));
      mockErrorQueueService.resumeQueue = jest.fn().mockRejectedValue(new Error('Resume failed'));
      mockErrorQueueService.clearQueue = jest.fn().mockRejectedValue(new Error('Clear failed'));
   });

   afterEach(() => {
      jest.clearAllMocks();
   });

   it('should be defined', () => {
      expect(queueManager).toBeDefined();
   });

   describe('registerQueue', () => {
      it('should register a queue', () => {
         queueManager.registerQueue('testQueue', mockQueueService);
         expect(queueManager.getQueue('testQueue')).toBe(mockQueueService);
      });

      it('should override existing queue with same name', () => {
         queueManager.registerQueue('testQueue', mockQueueService);
         const newMockQueueService = new MockBaseQueueService();
         queueManager.registerQueue('testQueue', newMockQueueService);
         expect(queueManager.getQueue('testQueue')).toBe(newMockQueueService);
      });

      it('should register multiple queues', () => {
         queueManager.registerQueue('testQueue1', mockQueueService);
         queueManager.registerQueue('testQueue2', mockQueueService);
         expect(queueManager.getAllQueue().size).toBe(2);
      });
   });

   describe('getQueue', () => {
      it('should return the registered queue', () => {
         queueManager.registerQueue('testQueue', mockQueueService);
         expect(queueManager.getQueue('testQueue')).toBe(mockQueueService);
      });

      it('should return undefined for non-existent queue', () => {
         expect(queueManager.getQueue('nonExistentQueue')).toBeUndefined();
      });
   });

   describe('getAllQueue', () => {
      it('should return all registered queues', () => {
         queueManager.registerQueue('testQueue1', mockQueueService);
         queueManager.registerQueue('testQueue2', mockQueueService);
         const allQueues = queueManager.getAllQueue();
         expect(allQueues.size).toBe(2);
         expect(allQueues.get('testQueue1')).toBe(mockQueueService);
         expect(allQueues.get('testQueue2')).toBe(mockQueueService);
      });

      it('should return an empty map when no queues are registered', () => {
         expect(queueManager.getAllQueue().size).toBe(0);
      });
   });

   describe('getGlobalStatus', () => {
      it('should return status of all queues', async () => {
         queueManager.registerQueue('testQueue1', new MockBaseQueueService({
            waiting: 1,
            active: 2,
            completed: 3,
            failed: 4,
            delayed: 5,
         }));
         queueManager.registerQueue('testQueue2', new MockBaseQueueService({
            waiting: 5,
            active: 4,
            completed: 3,
            failed: 2,
            delayed: 1,
         }));
         const status = await queueManager.getGlobalStatus();
         expect(status).toEqual({
            testQueue1: { waiting: 1, active: 2, completed: 3, failed: 4, delayed: 5 },
            testQueue2: { waiting: 5, active: 4, completed: 3, failed: 2, delayed: 1 },
         });
      });

      it('should return an empty object when no queues are registered', async () => {
         const status = await queueManager.getGlobalStatus();
         expect(status).toEqual({});
      });


   });

   describe('pauseAllQueues', () => {




      it('should not throw when no queues are registered', async () => {
         await expect(queueManager.pauseAllQueues()).resolves.not.toThrow();
      });
   });

   describe('resumeAllQueues', () => {


      it('should not throw when no queues are registered', async () => {
         await expect(queueManager.resumeAllQueues()).resolves.not.toThrow();
      });
   });

   describe('clearAllQueues', () => {

      it('should not throw when no queues are registered', async () => {
         await expect(queueManager.clearAllQueues()).resolves.not.toThrow();
      });
   });
});