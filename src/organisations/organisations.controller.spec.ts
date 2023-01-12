import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';
import { Prisma } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const testOrganisation: Prisma.OrganisationCreateInput = {
  name: 'test',
  domainName: 'email@email.com',
};

const updatedOrganisation = {
  name: 'test',
  domainName: 'email@email.com',
};

describe('OrganisationsController', () => {
  let controller: OrganisationsController;
  let organisationsService: OrganisationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationsController],
      providers: [
        {
          provide: OrganisationsService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(testOrganisation),
            create: jest.fn().mockReturnValue(testOrganisation),
            updateDomainName: jest.fn().mockResolvedValue(updatedOrganisation),
          },
        },
      ],
    }).compile();

    controller = module.get<OrganisationsController>(OrganisationsController);
    organisationsService = module.get<OrganisationsService>(OrganisationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get organisations', () => {
    it('should return an organisation', async () => {
      expect(await controller.findOne(1)).toEqual(testOrganisation);
    });

    it("should throw an error if the organisation doesn't exist", async () => {
      jest.spyOn(organisationsService, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(controller.findOne(1)).rejects.toThrowError('Not Found');
    });
  });

  describe('create organisation', () => {
    it('should create an organisation', async () => {
      expect(await controller.create(testOrganisation)).toEqual(testOrganisation);
    });

    it('should throw an error if the domain name is invalid', async () => {
      jest.spyOn(organisationsService, 'create').mockRejectedValue(new BadRequestException());
      await expect(controller.create(testOrganisation)).rejects.toThrowError('Bad Request');
    });
  });

  describe('update organisation', () => {
    it('should update an organisation', async () => {
      expect(
        await controller.updateDomainName(1, {
          domainName: 'email@email.com',
        }),
      ).toEqual(updatedOrganisation);
    });

    it("should throw an error if the organisation doesn't exist", async () => {
      jest.spyOn(organisationsService, 'updateDomainName').mockRejectedValue(new NotFoundException());
      await expect(
        controller.updateDomainName(1, {
          domainName: 'email@email.com',
        }),
      ).rejects.toThrowError('Not Found');
    });
  });
});
