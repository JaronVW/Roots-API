import { Test, TestingModule } from '@nestjs/testing';
import { ResetPasswordRequestService } from './reset-password-request.service';

describe('ResetPasswordRequestService', () => {
  let service: ResetPasswordRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResetPasswordRequestService],
    }).compile();

    service = module.get<ResetPasswordRequestService>(ResetPasswordRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
