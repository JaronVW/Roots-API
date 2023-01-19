import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { Organisation, Prisma } from '@prisma/client';
import { UpdateDomainNameDto } from './dto/UpdateDomainNameDto';
import { Public } from '../decorators/Public';

@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Post()
  @Public()
  async create(@Body() organisation: Prisma.OrganisationCreateInput): Promise<Organisation> {
    return await this.organisationsService.create(organisation);
  }

  @Patch(':id')
  async updateDomainName(
    @Param('id') id: number,
    @Body() updateDomainNameDto: UpdateDomainNameDto,
  ): Promise<Organisation> {
    return await this.organisationsService.updateDomainName(id, updateDomainNameDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Organisation> {
    return await this.organisationsService.findOne({ id: Number(id) });
  }
}
