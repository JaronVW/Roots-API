import { BadRequestException, Injectable, Request } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaClientService } from '../../src/prisma-client/prisma-client.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaClientService) {}

  async findOne(username: string): Promise<User> {
    return await this.prisma.user.findUnique({ where: { email: username } });
  }

  async create(user: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({ data: user });
  }

  async setInactive(userId: number): Promise<any> {
    try {
      await this.prisma.user.update({ where: { id: userId }, data: { isAtive: false } });
      return { statusCode: 200, message: 'set inactive' };
    } catch (e) {
      throw new BadRequestException("Can't set user inactive");
    }
  }

  async setActive(userId: number): Promise<any> {
    try {
      await this.prisma.user.update({ where: { id: userId }, data: { isAtive: true } });
      return { statusCode: 200, message: 'set active' };
    } catch (e) {
      throw new BadRequestException("Can't set user admin");
    }
  }

  async getOranisationUsers(
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
        },
      });
    } catch (error) {
      throw new BadRequestException("Can't retrieve users");
    }
  }
}
