import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientService } from '../prisma-client/prisma-client.service';
import { VerificationRequestService } from './verification-request.service';

describe('VerificationRequestService', () => {
  let service: VerificationRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerificationRequestService, PrismaClientService],
    }).compile();

    service = module.get<VerificationRequestService>(VerificationRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
