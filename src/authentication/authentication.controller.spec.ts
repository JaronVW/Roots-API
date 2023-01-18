import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { OrganisationsService } from '../organisations/organisations.service';
import { PrismaClientService } from '../prisma-client/prisma-client.service';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { AuthenticationModule } from './authentication.module';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        AuthenticationService,
        PrismaClientService,
        {
          provide: OrganisationsService,
          useValue: {},
        },
        UsersService,
      ],
      imports: [AuthenticationModule],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
