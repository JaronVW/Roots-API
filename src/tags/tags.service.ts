import { Injectable } from '@nestjs/common';
import { PrismaClientService } from '../../src/prisma-client/prisma-client.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaClientService) {}

  async findAll() {
    return await this.prisma.tag.findMany({
      orderBy: { Events: { _count: 'desc' } },
      include: {
        _count: {
          select: {
            Events: true,
          },
        },
      },
    });
  }
}
