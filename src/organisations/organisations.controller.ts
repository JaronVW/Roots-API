import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { Organisation, Prisma } from '@prisma/client';

@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Post()
  async create(@Body() orgnisation: Prisma.OrganisationCreateInput): Promise<Organisation> {
    return await this.organisationsService.create(orgnisation);
  }

  @Patch(':id')
  async updateDomainName(@Body() id: number, @Body() organisationName: string): Promise<Organisation> {
    return await this.organisationsService.updateOrganisationName(id, organisationName);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Organisation> {
    return await this.organisationsService.findOne(id);
  }

}
