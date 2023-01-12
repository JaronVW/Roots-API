import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaClientService } from '../../src/prisma-client/prisma-client.service';
import { EventsCreateDto, EventsUpdateDto } from './dto/events.dto';
import { EventQueryParamsDto } from './dto/events.query.params.dto';
import * as fs from 'fs';
import { promisify } from 'util';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaClientService) {}

  async create(event: EventsCreateDto): Promise<Event> {
    try {
      return await this.prisma.event.create({
        data: {
          ...event,
          tags: {
            connectOrCreate: event.tags.map((tag) => ({
              where: { subject: tag.subject },
              create: { subject: tag.subject },
            })),
          },
          multimediaItems: {
            createMany: { data: event.multimediaItems, skipDuplicates: true },
          },
          userId: event.userId,
        },
      });
    } catch (e) {
      throw new BadRequestException("Can't create event");
    }
  }

  async findOne(eventUniqueInput: Prisma.EventWhereUniqueInput): Promise<Event | null> {
    const event = await this.prisma.event.findUnique({
      where: eventUniqueInput,
      include: {
        multimediaItems: true,
        tags: true,
      },
    });
    if (event != null) return event;
    throw new NotFoundException("Can't find event");
  }

  async findAll(queryDto: EventQueryParamsDto): Promise<Event[]> {
    try {
      let prismaQuery = {};
      if (queryDto.searchQuery != undefined)
        prismaQuery = {
          where: {
            OR: [
              { title: { contains: queryDto.searchQuery } },
              { tags: { some: { subject: { equals: queryDto.searchQuery } } } },
              { description: { contains: queryDto.searchQuery } },
            ],
            AND: {
              OR: [{ isArchived: false }, { isArchived: queryDto.getArchivedItems }],
            },
          },
          orderBy: { dateOfEvent: queryDto.order } as any,
          skip: Number(queryDto.min),
          take: Number(queryDto.max),
          include: {
            tags: true,
          },
        };
      else
        prismaQuery = {
          where: {
            OR: [{ isArchived: false }, { isArchived: queryDto.getArchivedItems }],
          },
          orderBy: { dateOfEvent: queryDto.order } as any,
          skip: Number(queryDto.min),
          take: Number(queryDto.max),
          include: {
            tags: true,
          },
        };
      return await this.prisma.event.findMany(prismaQuery);
    } catch (error) {
      console.log(error);
      throw new BadRequestException("Can't retrieve events");
    }
  }

  async update(params: { where: Prisma.EventWhereUniqueInput; event: EventsUpdateDto }): Promise<Event> {
    try {
      const { where, event } = params;
      const eventToUpdate = await this.prisma.event.findUnique({
        where,
        include: {
          multimediaItems: true,
        },
      });
      const multimediaItemsToDelete = eventToUpdate.multimediaItems.filter((item) => {
        return !event.multimediaItems.some((item2) => item2.multimedia == item.multimedia);
      });
      const multimediaItemsToDeleteIds = multimediaItemsToDelete.map((item) => item.id);
      await this.prisma.multimedia.deleteMany({
        where: {
          id: {
            in: multimediaItemsToDeleteIds,
          },
        },
      });

      // delete files from disk
      const multimediaItemsToDeletePaths = multimediaItemsToDelete.map((item) => item.path);
      multimediaItemsToDeletePaths.forEach((path) => {
        if (path != null) {
          promisify(fs.unlink)(path).catch((err) => console.log(err));
        }
      });

      const updatedEvent = await this.prisma.event.update({
        data: {
          ...event,
          tags: {
            connectOrCreate: event.tags.map((tag) => ({
              where: { subject: tag.subject },
              create: { subject: tag.subject },
            })),
          },
          multimediaItems: {
            connectOrCreate: event.multimediaItems.map((item) => ({
              where: { path: item.path },
              create: item,
            })),
          },
          userId: event.userId,
        },
        where,
        include: {
          tags: true,
          multimediaItems: true,
        },
      });
      return updatedEvent;
    } catch (error) {
      console.log('error update', error);
      if (error.code == 'P2025') throw new NotFoundException("Event doesn't exist");
      throw new BadRequestException();
    }
  }

  async remove(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    try {
      return await this.prisma.event.delete({
        where,
      });
    } catch (error) {
      if (error.code == 'P2025') throw new NotFoundException("Event doesn't exist");
      throw new BadRequestException();
    }
  }

  async archive(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    try {
      return await this.prisma.event.update({ where, data: { isArchived: true } });
    } catch (error) {
      if (error.code == 'P2025') throw new NotFoundException("Event doesn't exist");
      throw new BadRequestException("Can't archive event");
    }
  }

  async unarchive(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    try {
      return await this.prisma.event.update({ where, data: { isArchived: false } });
    } catch (error) {
      if (error.code == 'P2025') throw new NotFoundException("Event doesn't exist");
      throw new BadRequestException("Can't unarchive event");
    }
  }
}
