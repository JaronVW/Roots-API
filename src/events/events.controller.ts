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
      const decodedJwt = (this.jwtService.decode(req.headers.authorization.split(' ')[1]) as any) || {
        organisationId: null,
      };
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
      const decodedJwt = (this.jwtService.decode(req.headers.authorization.split(' ')[1]) as any)
      return await this.eventsService.findAll(queryDto, decodedJwt.organisationId);
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
    if (files && event.multimediaItems) {
      for (let i = 0; i < files.length; i++) {
        event.multimediaItems.filter((multimediaItem) => !multimediaItem.path)[i].multimedia = files[i].originalname;
        event.multimediaItems.filter((multimediaItem) => !multimediaItem.path)[i].path = files[i].filename;
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
