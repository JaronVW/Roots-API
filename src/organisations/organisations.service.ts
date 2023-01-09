import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';

@Injectable()
export class OrganisationsService {
  constructor(private readonly prisma: PrismaClientService) {}

  public async findOne(id: number) {
    return await this.prisma.organisation
      .findUnique({
        where: { id: Number(id) },
      })
      .catch((error) => {
        console.log(error);
        if (error.code == 'P2025') throw new NotFoundException("Can't find organisation");
        throw new BadRequestException("Can't get organisation");
      });
  }

  public async create(data: Prisma.OrganisationCreateInput) {
    if (!data.domainName.match(/@\w+([\.-]?\w+)*(\.\w{2,})+$/)) throw new BadRequestException('Invalid domain name');
    return await this.prisma.organisation
      .create({
        data: data,
      })
      .catch((error) => {
        if (error.code == 'P2002') throw new BadRequestException('Organisation with that domain name already exists');
        throw new BadRequestException("Can't create organisation");
      });
  }

  public async updateOrganisationName(id: number, organisationName: string) {
    if (!organisationName.match(/@\w+([\.-]?\w+)*(\.\w{2,})+$/)) throw new BadRequestException('Invalid domain name');
    return await this.prisma.organisation
      .update({
        where: { id: id },
        data: { name: organisationName },
      })
      .catch((error) => {
        if (error.code == 'P2025') throw new NotFoundException("Can't find organisation");
        throw new BadRequestException("Can't update organisation name");
      });
  }
}
