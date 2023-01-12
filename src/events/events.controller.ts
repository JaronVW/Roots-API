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
  Patch,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Event } from '@prisma/client';
import { EventsCreateDto, EventsUpdateDto } from './dto/events.dto';
import { EventQueryParamsDto } from './dto/events.query.params.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() event: EventsCreateDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    if (files && event.multimediaItems) {
      for (let i = 0; i < files.length; i++) {
        event.multimediaItems[i].multimedia = files[i].originalname;
        event.multimediaItems[i].path = files[i].path;
      }
    }
    try {
      return await this.eventsService.create(event);
    } catch (e) {
      console.log(e);
      throw new HttpException(e, 400);
    }
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() queryDto: EventQueryParamsDto) {
    try {
      return await this.eventsService.findAll(queryDto);
    } catch (e) {
      throw new HttpException(e, 400);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event | null> {
    if (Number.isNaN(Number(id))) throw new HttpException('Invalid id', 400);
    return this.eventsService.findOne({ id: Number(id) });
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('files'))
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() event: EventsUpdateDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (files && event.multimediaItems) {
      for (let i = 0; i < files.length; i++) {
        event.multimediaItems[i].multimedia = files[i].originalname;
        event.multimediaItems[i].path = files[i].path;
      }
    }
    return this.eventsService.update({
      where: { id: Number(id) },
      event,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Event> {
    if (Number.isNaN(Number(id))) throw new HttpException('Invalid id', 400);
    return this.eventsService.remove({ id: Number(id) });
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string): Promise<Event> {
    return this.eventsService.archive({ id: Number(id) });
  }

  @Patch(':id/unarchive')
  async unarchive(@Param('id') id: string): Promise<Event> {
    return this.eventsService.unarchive({ id: Number(id) });
  }
}
