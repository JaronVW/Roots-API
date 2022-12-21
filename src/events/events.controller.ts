import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  HttpException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Event } from '@prisma/client';
import { eventsCreateDto, eventsUpdateDto } from './dto/events.dto';
import { EventQueryParamsDto } from './dto/events.query.params.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() event: eventsCreateDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    event.multimediaItems = [];
    for (let i = 0; i < files.length; i++) {
      event.multimediaItems[i].multimedia = files[i].path;
    }
    console.log(event);
    try {
      return this.eventsService.create(event);
    } catch (e) {
      throw new HttpException(e, 400);
    }
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() queryDto: EventQueryParamsDto) {
    try {
      return this.eventsService.findAll(queryDto);
    } catch (e) {
      throw new HttpException(e, 400);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event | null> {
    return this.eventsService.findOne({ id: Number(id) });
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: string, @Body() event: eventsUpdateDto) {
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
