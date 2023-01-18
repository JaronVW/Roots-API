import { Injectable } from '@nestjs/common';
import { verificationRequest } from '@prisma/client';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';

@Injectable()
export class VerificationRequestService {
  constructor(private readonly prismaClient: PrismaClientService) {}

  async getPasswordRequest(token: string): Promise<verificationRequest> {
    console.log(token);
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

  async createRequest(email: string, token: string, expires: Date): Promise<boolean> {
    return this.prismaClient.verificationRequest
      .create({ data: { email, token,expires } })
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }
}
