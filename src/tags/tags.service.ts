import { Injectable } from '@nestjs/common';
import { PrismaClientService } from '../../src/prisma-client/prisma-client.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaClientService) {}

  async findAll(organisationId: number) {
    const tags = await this.prisma.tag.findMany({
      where: { organisationId },
      orderBy: [{ Events: { _count: 'desc' } }, { subject: 'asc' }],
      include: {
        _count: {
          select: {
            Events: true,
          },
        },
      },
    });
    return tags.map((tag) => ({
      id: tag.id,
      subject: tag.subject,
      count: tag._count.Events,
    }));
  }
}
