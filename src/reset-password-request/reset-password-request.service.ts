import { Injectable } from '@nestjs/common';
import { ResetPasswordRequest } from '@prisma/client';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';

@Injectable()
export class ResetPasswordRequestService {
  constructor(private readonly prismaClient: PrismaClientService) {}

  async getEmail(token: string): Promise<ResetPasswordRequest> {
    return await this.prismaClient.resetPasswordRequest.findFirst({ where: { token } });
  }

  async generatePasswordRequest(email: string, token: string, expires: Date): Promise<ResetPasswordRequest> {
    return await this.prismaClient.resetPasswordRequest.create({ data: { email, token, expires } });
  }

  async deleteRequest(email: string): Promise<boolean> {
    return this.prismaClient.resetPasswordRequest
      .delete({ where: { email } })
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }
}
