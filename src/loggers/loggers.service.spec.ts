// import { Test, TestingModule } from '@nestjs/testing';
// import { LoggersService } from './loggers.service';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

// describe('LoggersService', () => {
//    let service: LoggersService;
//    let mockLogger: any;

//    beforeEach(async () => {
//       mockLogger = {
//          info: jest.fn(),
//          error: jest.fn(),
//          warn: jest.fn(),
//          debug: jest.fn(),
//          verbose: jest.fn(),
//       };

//       const module: TestingModule = await Test.createTestingModule({
//          providers: [
//             LoggersService,
//             {
//                provide: WINSTON_MODULE_PROVIDER,
//                useValue: mockLogger,
//             },
//          ],
//       }).compile();

//       service = module.get<LoggersService>(LoggersService);
//    });

//    it('should be defined', () => {
//       expect(service).toBeDefined();
//    });

//    describe('setContext', () => {
//       it('should set the context', () => {
//          service.setContext('TestContext');
//          expect((service as any).context).toBe('TestContext');
//       });
//    });

//    describe('log', () => {
//       it('should call logger.info with correct parameters', () => {
//          service.setContext('TestContext');
//          service.log('Test message');
//          expect(mockLogger.info).toHaveBeenCalledWith('Test message', { context: 'TestContext' });
//       });

//       it('should use provided context if available', () => {
//          service.log('Test message', 'CustomContext');
//          expect(mockLogger.info).toHaveBeenCalledWith('Test message', { context: 'CustomContext' });
//       });
//    });

//    describe('error', () => {
//       it('should call logger.error with correct parameters', () => {
//          service.setContext('TestContext');
//          service.error('Error message', 'Error trace');
//          expect(mockLogger.error).toHaveBeenCalledWith('Error message', {
//             context: 'TestContext',
//             trace: 'Error trace',
//          });
//       });
//    });

//    describe('warn', () => {
//       it('should call logger.warn with correct parameters', () => {
//          service.setContext('TestContext');
//          service.warn('Warning message');
//          expect(mockLogger.warn).toHaveBeenCalledWith('Warning message', {
//             context: 'TestContext',
//          });
//       });
//    });

//    describe('debug', () => {
//       it('should call logger.debug with correct parameters', () => {
//          service.setContext('TestContext');
//          service.debug('Debug message');
//          expect(mockLogger.debug).toHaveBeenCalledWith('Debug message', { context: 'TestContext' });
//       });
//    });

//    describe('verbose', () => {
//       it('should call logger.verbose with correct parameters', () => {
//          service.setContext('TestContext');
//          service.verbose('Verbose message');
//          expect(mockLogger.verbose).toHaveBeenCalledWith('Verbose message', {
//             context: 'TestContext',
//          });
//       });
//    });
// });
