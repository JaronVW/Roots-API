import { Test, TestingModule } from '@nestjs/testing';
import { VerificationRequestService } from './verification-request.service';

describe('VerificationRequestService', () => {
  let service: VerificationRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerificationRequestService],
    }).compile();

    service = module.get<VerificationRequestService>(VerificationRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
