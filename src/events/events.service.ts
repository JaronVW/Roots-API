import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaClientService } from '../prisma-client/prisma-client.service';
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
              where: { unique_tag_organisation: { subject: tag.subject, organisationId: event.organisationId } },
              create: { subject: tag.subject, organisationId: event.organisationId },
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

  async findOne(eventId: number, organisationId: number): Promise<Event | null> {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organisationId },
      include: {
        multimediaItems: true,
        tags: true,
      },
    });
    if (event != null) return event;
    throw new NotFoundException("Can't find event");
  }

  async findAll(queryDto: EventQueryParamsDto, organisationId: number): Promise<Event[]> {
    try {
      return await this.prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: queryDto.searchQuery } },
            { tags: { some: { subject: { equals: queryDto.searchQuery } } } },
            { description: { contains: queryDto.searchQuery } },
          ],
          AND: {
            OR: [{ isArchived: false }, { isArchived: queryDto.getArchivedItems }],
          },
          organisationId,
        },
        orderBy: { dateOfEvent: queryDto.order } as any,
        skip: Number(queryDto.min),
        take: Number(queryDto.max - queryDto.min),
        include: {
          tags: true,
        },
      });
    } catch (error) {
      throw new BadRequestException("Can't retrieve events");
    }
  }

  async getCount(queryDto: EventQueryParamsDto, organisationId: number): Promise<number> {
    try {
      return await this.prisma.event.count({
        where: {
          OR: [
            { title: { contains: queryDto.searchQuery } },
            { tags: { some: { subject: { equals: queryDto.searchQuery } } } },
            { description: { contains: queryDto.searchQuery } },
          ],
          AND: {
            OR: [{ isArchived: false }, { isArchived: queryDto.getArchivedItems }],
          },
          organisationId,
        },
      });
    } catch (error) {
      throw new BadRequestException("Can't get event count");
    }
  }

  async update(params: { where: Prisma.EventWhereUniqueInput; event: EventsUpdateDto }): Promise<Event> {
    try {
      const eventToDelete = await this.prisma.event.findFirst({
        where: { id: params.where.id, organisationId: params.event.organisationId },
      });
      if (eventToDelete == null) throw new UnauthorizedException();
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
      if (multimediaItemsToDelete.length > 0) {
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
            promisify(fs.unlink)('upload/' + path).catch((err) => console.log(err));
          }
        });
      }

      const updatedEvent = await this.prisma.event.update({
        data: {
          ...event,
          tags: {
            set: [],
            connectOrCreate: event.tags.map((tag) => ({
              where: { unique_tag_organisation: { subject: tag.subject, organisationId: event.organisationId } },
              create: { subject: tag.subject, organisationId: event.organisationId },
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
      if (error.status == 401) throw new UnauthorizedException();
      if (error.code == 'P2025' || error.status == 404) throw new NotFoundException("Event doesn't exist");
      throw new BadRequestException();
    }
  }

  async remove(where: Prisma.EventWhereUniqueInput, organisationId: number): Promise<Event> {
    try {
      const eventToDelete = await this.prisma.event.findFirst({
        where: { id: where.id, organisationId },
      });
      if (eventToDelete == null) throw new UnauthorizedException();
      return await this.prisma.event.delete({
        where,
      });
    } catch (error) {
      if (error.code == 'P2025') throw new NotFoundException("Event doesn't exist");
      throw new BadRequestException();
    }
  }

  async archive(where: Prisma.EventWhereUniqueInput, organisationId: number): Promise<Event> {
    try {
      const eventToDelete = await this.prisma.event.findFirst({
        where: { id: where.id, organisationId },
      });
      if (eventToDelete == null) throw new UnauthorizedException();
      return await this.prisma.event.update({ where, data: { isArchived: true } });
    } catch (error) {
      if (error.status == 401) throw new UnauthorizedException();
      if (error.code == 'P2025') throw new NotFoundException("Event doesn't exist");
      throw new BadRequestException("Can't archive event");
    }
  }

  async unarchive(where: Prisma.EventWhereUniqueInput, organisationId: number): Promise<Event> {
    try {
      const eventToDelete = await this.prisma.event.findFirst({
        where: { id: where.id, organisationId },
      });
      if (eventToDelete == null) throw new UnauthorizedException();
      return await this.prisma.event.update({ where, data: { isArchived: false } });
    } catch (error) {
      if (error.status == 401) throw new UnauthorizedException();
      if (error.code == 'P2025') throw new NotFoundException("Event doesn't exist");
      throw new BadRequestException("Can't unarchive event");
    }
  }
}
