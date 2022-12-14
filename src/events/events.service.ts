import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prismaClient/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.EventCreateInput): Promise<Event> {
    try {
      return await this.prisma.event.create({ data });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async findOne(
    eventUniqueInput: Prisma.EventWhereUniqueInput,
  ): Promise<Event | null> {
    try {
      return await this.prisma.event.findUnique({ where: eventUniqueInput });
    } catch (error) {
      if (error.code == 'P2025') throw new NotFoundException();
      else throw new BadRequestException();
    }
  }

  async findAll(): Promise<Event[]> {
    return await this.prisma.event.findMany();
  }

  async update(params: {
    where: Prisma.EventWhereUniqueInput;
    data: Prisma.EventUpdateInput;
  }): Promise<Event> {
    try {
      const { where, data } = params;
      return await this.prisma.event.update({
        data,
        where,
      });
    } catch (error) {
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
