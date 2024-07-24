import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, JobOptions, Queue, QueueOptions } from 'bull';

import { EventEmitter } from 'events';

export abstract class BaseQueueService<T = any> implements OnModuleInit, OnModuleDestroy {
   protected readonly logger: Logger;
   protected readonly eventEmitter: EventEmitter;

   constructor(protected readonly queue: Queue,
               protected readonly queueOptions: QueueOptions = {}) {
      this.logger = new Logger(this.constructor.name);
      this.eventEmitter = new EventEmitter();
   }

   async onModuleDestroy() {
      await this.cleanupListeners();
   }

   async onModuleInit() {
      await this.setupQueue();
   }

   private async setupQueue() {
      this.setupListeners();
      await this.queue.isReady();
      this.logger.log(`Queue ${this.queue.name} is ready`);
   }

   private setupListeners() {
      this.queue.on('error', this.handleError.bind(this));
      this.queue.on('waiting', this.handleWaiting.bind(this));
      this.queue.on('active', this.handleActive.bind(this));
      this.queue.on('completed', this.handleCompleted.bind(this));
      this.queue.on('failed', this.handleFailed.bind(this));
      this.queue.on('stalled', this.handleStalled.bind(this));
   }

   private async cleanupListeners() {
      await this.queue.close();
      this.logger.log(`Queue ${this.queue.name} listeners have been cleaned up`);
   }

   protected handleError(error: Error) {
      this.logger.error(`Queue ${this.queue.name} encountered an error`, error.stack);
   }

   protected handleWaiting(jobId: string | number) {
      this.logger.debug(`Job ${jobId} is waiting in queue ${this.queue.name}`);
   }

   protected handleActive(job: Job) {
      this.logger.log(`Job ${job.id} has started in queue ${this.queue.name}`);
   }

   protected handleCompleted(job: Job, result: any) {
      this.logger.log(`Job ${job.id} has been completed in queue ${this.queue.name}`);
      this.eventEmitter.emit('completed', job, result);
   }

   protected handleFailed(job: Job, err: Error) {
      this.logger.error(`Job ${job.id} has failed in queue ${this.queue.name}`, err.stack);
      this.eventEmitter.emit('failed', job, err);
   }

   protected handleStalled(job: Job) {
      this.logger.warn(`Job ${job.id} has stalled in queue ${this.queue.name}`);
   }

   async addJob(data: T, opts?: JobOptions): Promise<Job<T>> {
      const job = await this.queue.add(data, opts);
      this.logger.log(`Added job ${job.id} to queue ${this.queue.name}`);
      return job;
   }

   abstract processJob(job: Job<T>): Promise<any>;

   async getJob(jobId: string | number): Promise<Job<T>> | null {
      return this.queue.getJob(jobId);
   }

   async removeJob(jobId: string | number): Promise<void> {
      const job = await this.getJob(jobId);
      if (job) {
         await job.remove();
         this.logger.log(`Removed job ${jobId} from queue ${this.queue.name}`);
      }
   }

   async pauseQueue(): Promise<void> {
      await this.queue.pause();
      this.logger.log(`Queue ${this.queue.name} has been paused`);
   }

   async resumeQueue(): Promise<void> {
      await this.queue.resume();
      this.logger.log(`Queue ${this.queue.name} has been resumed`);
   }

   async clearQueue(): Promise<void> {
      await this.queue.empty();
      this.logger.log(`Queue ${this.queue.name} has been cleared`);
   }

   async getQueueStatus(): Promise<{
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
   }> {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
         this.queue.getWaitingCount(),
         this.queue.getActiveCount(),
         this.queue.getCompletedCount(),
         this.queue.getFailedCount(),
         this.queue.getDelayedCount(),
         this.queue.getDelayedCount(),
      ]);
      return { waiting, active, completed, failed, delayed };
   }

   async retryFailedJob(): Promise<void> {
      const failedJobs = await this.queue.getFailed();
      for (const job of failedJobs) {
         await job.retry();
      }
      this.logger.log(`Retrying ${failedJobs.length} failed jobs in queue ${this.queue.name}`);
   }

   onJobCompleted(callback: (job: Job<T>, result: any) => void): void {
      this.eventEmitter.on('completed', callback);
   }

   onJobFailed(callback: (job: Job<T>, error: Error) => void): void {
      this.eventEmitter.on('failed', callback);
   }

}