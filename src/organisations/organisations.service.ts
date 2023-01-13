import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Organisation, Prisma } from '@prisma/client';
import { PrismaClientService } from '../../src/prisma-client/prisma-client.service';
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
    if (!data.domainName.match(/\w+([\.-]?\w+)*(\.\w{2,})+$/)) throw new BadRequestException('Invalid domain name');
    try {
      return await this.prisma.organisation.create({
        data: data,
      });
    } catch (error) {
      let errorMessage = 'error already exists';
      if (error.meta != undefined) {
        if ((error.meta.target = 'organisation_domain_name_key'))
          errorMessage = 'Organisation with that name already exists';
        if ((error.meta.target = 'organisation_name_key')) errorMessage = 'An organisation is already using that domain name';
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
          if ((error.meta.target = 'organisation_domain_name_key'))
            errorMessage = 'Organisation with that domain name already exists';
          if ((error.meta.target = 'organisation_name_key'))
            errorMessage = 'Organisation with that name already exists';
        }
        if (error.code == 'P2002') throw new BadRequestException(errorMessage);
        throw new BadRequestException("Can't update organisation name");
      });
  }
}
