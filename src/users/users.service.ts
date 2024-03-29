import { BadRequestException, ForbiddenException, Injectable, Request } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaClientService } from '../prisma-client/prisma-client.service';

@Injectable()
export class UsersService {
  async updatePassword(email: string, hash: string) {
    return this.prisma.user
      .update({ where: { email }, data: { password: hash } })
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }
  constructor(private readonly prisma: PrismaClientService) {}

  async findOne(username: string): Promise<User> {
    return await this.prisma.user.findUnique({ where: { email: username } });
  }

  async create(user: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({ data: user });
  }

  async setInactive(userId: number, organisationId: number): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user.organisationId == organisationId) {
        await this.prisma.user.update({ where: { id: userId }, data: { isActive: false } });
        return { statusCode: 200, message: 'Set inactive' };
      } else {
        throw new ForbiddenException('Forbidden');
      }
    } catch (e) {
      if (e instanceof ForbiddenException) throw e;
      throw new BadRequestException("Can't set user inactive");
    }
  }

  async setActive(userId: number, organisationId: number): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user.organisationId == organisationId) {
        await this.prisma.user.update({ where: { id: userId }, data: { isActive: true } });
        return { statusCode: 200, message: 'Set active' };
      } else {
        throw new ForbiddenException('Forbidden');
      }
    } catch (e) {
      if (e instanceof ForbiddenException) throw e;
      throw new BadRequestException("Can't set user active");
    }
  }

  async getOrganisationUsers(
    @Request() req,
  ): Promise<{ id: number; email: string; firstName: string; lastName: string }[]> {
    const user = req.user;
    try {
      return await this.prisma.user.findMany({
        where: {
          organisationId: user.organisationId,
          email: { not: user.username },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });
    } catch (error) {
      throw new BadRequestException("Can't retrieve users");
    }
  }

  async update(email: string): Promise<boolean> {
    return this.prisma.user
      .update({ where: { email }, data: { isActive: true } })
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }
}
