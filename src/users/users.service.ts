import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaClientService) {}

  async findOne(username: string): Promise<User> {
    return await this.prisma.user.findUnique({ where: { email: username } });
  }
}
