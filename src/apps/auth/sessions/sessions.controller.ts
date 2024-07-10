import { Controller, Get } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { MessageResponse } from 'src/common';

@Controller('sessions')
export class SessionsController {
   constructor(private readonly sessionService: SessionsService) {}

   // @Get()
   // @ApiOperation({ summary: 'Get all sessions' })
   // @ApiOkResponse({ description: 'Sessions were retrieved successfully' })
   // public async getSessions(): Promise<MessageResponse> {
   //    return await this.sessionService.getSessions();
   // }
}
