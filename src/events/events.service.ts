import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaClientService } from '../../src/prisma-client/prisma-client.service';
import { EventsCreateDto, EventsUpdateDto } from './dto/events.dto';
import { EventQueryParamsDto } from './dto/events.query.params.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaClientService) {}

  async create(event: EventsCreateDto): Promise<Event> {
    console.log(event);
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
            createMany: { data: event.multimediaItems, skipDuplicates: false },
          },
          userId: event.userId,
        },
      });
    } catch (e) {
      console.log(e);
      throw new BadRequestException();
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
    throw new NotFoundException();
  }

  async findAll(queryDto: EventQueryParamsDto): Promise<Event[]> {
    let prismaQuery = {};
    if (queryDto.searchQuery == undefined)
      prismaQuery = {
        where: {
          OR: [
            { title: { contains: queryDto.searchQuery } },
            { tags: { some: { subject: { equals: queryDto.searchQuery } } } },
            { description: { contains: queryDto.searchQuery } },
          ],
          AND: { isArchived: false },
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
          isArchived: false,
        },
        orderBy: { dateOfEvent: queryDto.order } as any,
        skip: Number(queryDto.min),
        take: Number(queryDto.max),
        include: {
          tags: true,
        },
      };
    return await this.prisma.event.findMany(prismaQuery);
  }

  async update(params: { where: Prisma.EventWhereUniqueInput; event: EventsUpdateDto }): Promise<Event> {
    try {
      const { where, event } = params;
      return await this.prisma.event.update({
        data: {
          ...event,
          tags: {
            connectOrCreate: event.tags.map((tag) => ({
              where: { subject: tag.subject },
              create: { subject: tag.subject },
            })),
          },
          multimediaItems: {
            createMany: { data: event.multimediaItems, skipDuplicates: false },
          },
          userId: event.userId,
        },
        where,
        include: {
          tags: true,
          multimediaItems: true,
        },
      });
    } catch (error) {
      console.log('error update', error);
      if (error.code == 'P2025') throw new NotFoundException();
      throw new BadRequestException();
    }
  }

  async remove(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    try {
      return await this.prisma.event.delete({
        where,
      });
    } catch (error) {
      console.log('error remove', error);
      if (error.code == 'P2025') throw new NotFoundException();
      throw new BadRequestException();
    }
  }

  async archive(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    try {
      return await this.prisma.event.update({ where, data: { isArchived: true } });
    } catch (error) {
      if (error.code == 'P2025') throw new NotFoundException();
      throw new BadRequestException();
    }
  }

  async unarchive(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    try {
      return await this.prisma.event.update({ where, data: { isArchived: false } });
    } catch (error) {
      if (error.code == 'P2025') throw new NotFoundException();
      throw new BadRequestException();
    }
  }
  
}
