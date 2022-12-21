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
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { Event } from '@prisma/client';
import { eventsCreateDto, eventsUpdateDto } from './dto/events.dto';
import { EventQueryParamsDto } from './dto/events.query.params.dto';
import { EventsService } from './events.service';
import { FormDataRequest } from 'nestjs-form-data';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() event: eventsCreateDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    try {
      files.forEach((file, index) => {
        event.multimediaItems[index].multimedia = file.path;
      });
      return this.eventsService.create(event);
    } catch (e) {
      console.log(e);
      throw new BadRequestException();
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
