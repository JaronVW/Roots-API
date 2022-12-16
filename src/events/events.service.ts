import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';
import { eventsCreateDto } from './dto/events.dto';
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
          tags: { connect: event.tags },

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
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  async findOne(
    eventUniqueInput: Prisma.EventWhereUniqueInput,
  ): Promise<Event | null> {
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
      if (error.code == 'P2025') throw new NotFoundException();
      else throw new BadRequestException();
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

  async update(params: {
    where: Prisma.EventWhereUniqueInput;
    event: eventsCreateDto;
  }): Promise<Event> {
    try {
      const { where, event } = params;
      return await this.prisma.event.update({
        data: {
          ...event,
          paragraphs: { createMany: { data: event.paragraphs } },
          tags: { connect: event.tags },

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
      });
    } catch (error) {
      console.log(error);
      if (error.code == 'P2025') throw new NotFoundException();
      else throw new BadRequestException();
    }
  }

  async remove(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    try {
      return await this.prisma.event.delete({
        where,
      });
    } catch (error) {
      if (error.code == 'P2025') throw new NotFoundException();
      else throw new BadRequestException();
    }
  }
}
