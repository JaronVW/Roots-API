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
  UploadedFiles,
  UseInterceptors,
  Patch,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Event } from '@prisma/client';
import { EventsCreateDto, EventsUpdateDto } from './dto/events.dto';
import { EventQueryParamsDto } from './dto/events.query.params.dto';
import { EventsService } from './events.service';
import { JwtService } from '@nestjs/jwt';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService, private readonly jwtService: JwtService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() event: EventsCreateDto, @UploadedFiles() files: Array<Express.Multer.File>, @Request() req) {
    if (files && event.multimediaItems) {
      for (let i = 0; i < files.length; i++) {
        event.multimediaItems[i].multimedia = files[i].originalname;
        event.multimediaItems[i].path = files[i].filename;
      }
    }
    try {
      event.organisationId = req.user.organisationId;
      return await this.eventsService.create(event);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() queryDto: EventQueryParamsDto, @Request() req) {
    try {
      return await this.eventsService.findAll(queryDto, req.user.organisationId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('count')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getCount(@Query() queryDto: EventQueryParamsDto, @Request() req) {
    try {
      return await this.eventsService.getCount(queryDto, req.user.organisationId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<Event | null> {
    if (Number.isNaN(Number(id))) throw new BadRequestException('Invalid id');
    return this.eventsService.findOne(Number(id), req.user.organisationId);
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('files'))
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() event: EventsUpdateDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Request() req,
  ) {
    event.organisationId = req.user.organisationId;
    const multimediaItems = event.multimediaItems.filter((multimediaItem) => !multimediaItem.path);
    if (files && event.multimediaItems) {
      for (let i = 0; i < files.length; i++) {
        event.multimediaItems.find(
          (multimediaItem) => multimediaItem.multimedia == multimediaItems[i].multimedia,
        ).multimedia = files[i].originalname;
        event.multimediaItems.find(
          (multimediaItem) => multimediaItem.multimedia == multimediaItems[i].multimedia,
        ).path = files[i].filename;
      }
    }
    return this.eventsService.update({
      where: { id: Number(id) },
      event,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<Event> {
    if (Number.isNaN(Number(id))) throw new BadRequestException('Invalid id');
    return this.eventsService.remove({ id: Number(id) }, req.user.organisationId);
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string, @Request() req): Promise<Event> {
    return this.eventsService.archive({ id: Number(id) }, req.user.organisationId);
  }

  @Patch(':id/unarchive')
  async unarchive(@Param('id') id: string, @Request() req): Promise<Event> {
    return this.eventsService.unarchive({ id: Number(id) }, req.user.organisationId);
  }
}
