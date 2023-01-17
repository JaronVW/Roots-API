import { Injectable } from '@nestjs/common';
import { verificationRequest } from '@prisma/client';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';

@Injectable()
export class VerificationRequestService {
  constructor(private readonly prismaClient: PrismaClientService) {}

  async getEmail(token: string): Promise<verificationRequest> {
    return this.prismaClient.verificationRequest.findFirst({ where: { token } });
  }

  async deleteRequest(email: string): Promise<boolean> {
    return this.prismaClient.verificationRequest
      .delete({ where: { email } })
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }
}
