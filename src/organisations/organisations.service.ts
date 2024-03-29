import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Organisation, Prisma } from '@prisma/client';
import { PrismaClientService } from '../prisma-client/prisma-client.service';
import { UpdateDomainNameDto } from './dto/UpdateDomainNameDto';

@Injectable()
export class OrganisationsService {
  constructor(private readonly prisma: PrismaClientService) {}

  public async findOne(where: Prisma.OrganisationWhereUniqueInput): Promise<Organisation> {
    return await this.prisma.organisation
      .findUnique({
        where,
      })
      .then((organisation) => {
        if (!organisation) throw new NotFoundException("Can't find organisation");
        return organisation;
      });
  }

  public async create(data: Prisma.OrganisationCreateInput) {
    data.domainName = data.domainName.toLowerCase();
    if (!data.domainName.match(/\w+([\.-]?\w+)*(\.\w{2,})+$/)) throw new BadRequestException('Invalid domain name');
    try {
      const organisation = await this.prisma.organisation.create({
        data: data,
      });
      if (organisation) {
        await this.addStandardTags(organisation.id);
      }
      return organisation;
    } catch (error) {
      let errorMessage = 'error already exists';
      if (error.meta != undefined) {
        if (error.meta.target.toLowerCase() == 'organisation_name_key')
          errorMessage = 'Organisation with that name already exists';
        if (error.meta.target.toLowerCase() == 'organisation_domainname_key')
          errorMessage = 'An organisation is already using that domain name';
      }
      if (error.code == 'P2002') throw new BadRequestException(errorMessage);
      throw new BadRequestException("Can't create organisation");
    }
  }

  public async updateDomainName(id: number, updateDomainNameDto: UpdateDomainNameDto) {
    return await this.prisma.organisation
      .update({
        where: { id: Number(id) },
        data: { name: updateDomainNameDto.domainName },
      })
      .catch((error) => {
        if (error.code == 'P2025' || error.status == 404) throw new NotFoundException("Can't find organisation");
        let errorMessage = 'error already exists';
        if (error.meta != undefined) {
          if (error.meta.target.toLowerCase() == 'organisation_domainname_key')
            errorMessage = 'An organisation is already using that domain name';
          if (error.meta.target.toLowerCase() == 'organisation_name_key')
            errorMessage = 'Organisation with that name already exists';
        }
        if (error.code == 'P2002') throw new BadRequestException(errorMessage);
        throw new BadRequestException("Can't update organisation name");
      });
  }

  private async addStandardTags(organisationId: number) {
    const tag1 = {
      subject: 'Financiën',
      organisationId: organisationId,
    };

    const tag2 = {
      subject: 'Werk cultuur',
      organisationId: organisationId,
    };

    const tag3 = {
      subject: 'Administratie',
      organisationId: organisationId,
    };

    const tag4 = {
      subject: 'Infrastructuur',
      organisationId: organisationId,
    };

    const tag5 = {
      subject: 'Verhuizing',
      organisationId: organisationId,
    };

    await this.prisma.tag.createMany({
      data: [tag1, tag2, tag3, tag4, tag5],
    });
  }
}
