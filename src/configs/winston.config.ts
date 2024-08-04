import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, align, json } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
   let msg = `${timestamp} [${level}] : ${message}`;
   if (Object.keys(metadata).length > 0) {
      msg += JSON.stringify(metadata);
   }
   return msg;
});

export const winstonConfig: WinstonModuleOptions = {
   levels: winston.config.npm.levels,
   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
   format: combine(
      timestamp({
         format: 'YYYY-MM-DD HH:mm:ss',
      }),
      align(),
      json(),
   ),
   transports: [
      new winston.transports.Console({
         format: combine(
            colorize({ all: true }),
            timestamp({
               format: 'YYYY-MM-DD HH:mm:ss',
            }),
            align(),
            logFormat,
         ),
      }),
      new DailyRotateFile({
         filename: 'logs/application-%DATE%.log',
         datePattern: 'YYYY-MM-DD',
         zippedArchive: true,
         maxSize: '20m',
         maxFiles: '14d',
      }),
      new DailyRotateFile({
         filename: 'logs/error-%DATE%.log',
         datePattern: 'YYYY-MM-DD',
         zippedArchive: true,
         maxSize: '20m',
         maxFiles: '14d',
         level: 'error',
      }),
      // new ElasticsearchTransport({
      //    level: 'info',
      //    clientOpts: { node: 'http://localhost:9200' },
      //    indexPrefix: 'logs',
      // }),
   ],
   exceptionHandlers: [
      new DailyRotateFile({
         filename: 'logs/exceptions-%DATE%.log',
         datePattern: 'YYYY-MM-DD',
         zippedArchive: true,
         maxSize: '20m',
         maxFiles: '14d',
      }),
   ],
   rejectionHandlers: [
      new DailyRotateFile({
         filename: 'logs/rejections-%DATE%.log',
         datePattern: 'YYYY-MM-DD',
         zippedArchive: true,
         maxSize: '20m',
         maxFiles: '14d',
      }),
   ],
};
