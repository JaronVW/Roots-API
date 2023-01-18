import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientService } from '../prisma-client/prisma-client.service';
import { ResetPasswordRequestService } from './reset-password-request.service';

describe('ResetPasswordRequestService', () => {
  let service: ResetPasswordRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResetPasswordRequestService, PrismaClientService],
    }).compile();

    service = module.get<ResetPasswordRequestService>(ResetPasswordRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
