import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Event } from '@prisma/client';
import { eventsCreateDto } from './dto/events.dto';
import { EventQueryParamsDto } from './dto/events.query.params.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() event: eventsCreateDto) {
    return this.eventsService.create(event);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() queryDto: EventQueryParamsDto) {
    return this.eventsService.findAll(queryDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event | null> {
    return this.eventsService.findOne({ id: Number(id) });
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() event: eventsCreateDto) {
    return this.eventsService.update({
      where: { id: Number(id) },
      event,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Event> {
    return this.eventsService.remove({ id: Number(id) });
  }
}
