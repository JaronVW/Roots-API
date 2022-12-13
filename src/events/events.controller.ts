// eslint-disable-next-line prettier/prettier
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Event } from '@prisma/client';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() event: Event) {
    return this.eventsService.create(event);
  }

  @Get()
  async findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event | null> {
    return this.eventsService.findOne({ Id: Number(id) });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() event: Event) {
    return this.eventsService.update({
      where: { Id: Number(id) },
      data: event,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Event> {
    return this.eventsService.remove({ Id: Number(id) });
  }
}
