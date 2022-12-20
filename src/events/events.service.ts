import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaClientService } from '../../src/prisma-client/prisma-client.service';
import { eventsCreateDto, eventsUpdateDto } from './dto/events.dto';
import { EventQueryParamsDto } from './dto/events.query.params.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaClientService) {}

  async create(event: eventsCreateDto): Promise<Event> {
    try {
      return await this.prisma.event.create({
        data: {
          ...event,
          paragraphs: { createMany: { data: event.paragraphs } },
          tags: {
            connect: event.tags.map((tag) => ({
              id: tag.id,
            })),
          },

          customTags: {
            connectOrCreate: event.customTags.map((tag) => ({
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
      throw new HttpException(e.message, 400);
    }
  }

  async findOne(eventUniqueInput: Prisma.EventWhereUniqueInput): Promise<Event | null> {
    try {
      return await this.prisma.event.findUnique({
        where: eventUniqueInput,
        include: {
          paragraphs: true,
          multimediaItems: true,
          tags: true,
          customTags: true,
        },
      });
    } catch (error) {
      // console.log(error);
      throw new BadRequestException();
    }
  }

  async findAll(queryDto: EventQueryParamsDto): Promise<Event[]> {
    return await this.prisma.event.findMany({
      orderBy: { dateOfEvent: queryDto.order } as any,
      skip: Number(queryDto.min),
      take: Number(queryDto.max),
      include: {
        tags: true,
        customTags: true,
        paragraphs: true,
      },
    });
  }

  async update(params: { where: Prisma.EventWhereUniqueInput; event: eventsUpdateDto }): Promise<Event> {
    try {
      const { where, event } = params;
      // console.log(event);
      return await this.prisma.event.update({
        data: {
          ...event,
          paragraphs: {
            deleteMany: { eventId: where.id },
            createMany: {
              data: event.paragraphs.map((paragraph) => ({
                id: paragraph.id,
                title: paragraph.title,
                text: paragraph.text,
              })),
            },
          },
          tags: {
            set: [],
            connect: event.tags.map((tag) => ({
              id: tag.id,
            })),
          },

          customTags: {
            connectOrCreate: event.customTags.map((tag) => ({
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
          paragraphs: true,
          tags: true,
          customTags: true,
          multimediaItems: true,
        },
      });
    } catch (error) {
      // console.log(error);
      throw new HttpException(error.message, 400);
    }
  }

  async remove(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    try {
      return await this.prisma.event.delete({
        where,
      });
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
}
