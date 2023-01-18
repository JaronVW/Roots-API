import { Test } from '@nestjs/testing';
import { OrganisationsService } from './organisations.service';
import { PrismaClientService } from '../prisma-client/prisma-client.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateDomainNameDto } from './dto/UpdateDomainNameDto';
const testOrganisation: Prisma.OrganisationCreateInput = {
  name: 'test',
  domainName: 'email@email.com',
};

const updatedOrganisation = {
  name: 'test',
  domainName: 'email@email.com',
};

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let prisma: PrismaClientService;

  const db = {
    organisation: {
      findUnique: jest.fn().mockResolvedValue(testOrganisation),
      create: jest.fn().mockReturnValue(testOrganisation),
      save: jest.fn(),
      update: jest.fn().mockResolvedValue(updatedOrganisation),
    },
    tag: {
      createMany: jest.fn().mockResolvedValue({
        count: 1,
      }),
    },
  };

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        OrganisationsService,
        {
          provide: PrismaClientService,
          useValue: db,
        },
      ],
    }).compile();

    service = mod.get<OrganisationsService>(OrganisationsService);
    prisma = mod.get<PrismaClientService>(PrismaClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOne', () => {
    it('should get a single Event', async () => {
      const organisation = await service.findOne({ id: 1 });
      expect(organisation).toEqual(organisation);
    });

    it('wrong id, should return a Not found exception', async () => {
      jest.spyOn(prisma.organisation, 'findUnique').mockRejectedValueOnce(new NotFoundException());
      expect(service.findOne({ id: 5 })).rejects.toThrowError(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an organisation', async () => {
      const organisation = await service.create(testOrganisation);
      expect(organisation).toEqual(testOrganisation);
    });

    it('wrong domain name, should return a Bad request exception', async () => {
      jest.spyOn(prisma.organisation, 'create').mockRejectedValueOnce(new BadRequestException());
      expect(service.create(testOrganisation)).rejects.toThrowError(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update an organisation', async () => {
      const organisation = await service.updateDomainName(1, {
        domainName: 'email@email.com',
      });
      expect(organisation).toEqual(updatedOrganisation);
    });

    it('wrong domain name, should return a Bad request exception', async () => {
      jest.spyOn(prisma.organisation, 'update').mockRejectedValueOnce(new BadRequestException());
      expect(
        service.updateDomainName(1, {
          domainName: 'email@email.com',
        }),
      ).rejects.toThrowError(BadRequestException);
    });

    it('wrong id, should return a Not found exception', async () => {
      jest.spyOn(prisma.organisation, 'update').mockRejectedValueOnce(new NotFoundException());
      const updateDomainNameDto: UpdateDomainNameDto = {
        domainName: 'email@email.com',
      };
      expect(service.updateDomainName(5, updateDomainNameDto)).rejects.toThrowError(NotFoundException);
    });
  });
});
