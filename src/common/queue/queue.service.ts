import { Injectable } from '@nestjs/common';
import { BaseQueueService } from './base.queue.service';

@Injectable()
export class QueueManager {
   private queues: Map<string, BaseQueueService<any>> = new Map();

   registerQueue(name: string, queueService: BaseQueueService<any>): void {
      this.queues.set(name, queueService);
   }

   getQueue(name: string): BaseQueueService<any> | undefined {
      return this.queues.get(name);
   }

   getAllQueue(): Map<string, BaseQueueService<any>> {
      return this.queues;
   }

   async getGlobalStatus(): Promise<{ [queueName: string]: any }> {
      const status = {};
      for (const [key, value] of this.queues) {
         status[key] = await value.getQueueStatus();
      }
      return status;
   }

   async pauseAllQueues(): Promise<void> {
      await Promise.all([...this.queues.values()].map(queue => queue.pauseQueue()));
   }

   async resumeAllQueues(): Promise<void> {
      await Promise.all([...this.queues.values()].map(queue => queue.resumeQueue()));
   }

   async clearAllQueues(): Promise<void> {
      await Promise.all([...this.queues.values()].map(queue => queue.clearQueue()));
   }

}
