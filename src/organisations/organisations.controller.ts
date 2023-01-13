import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { Organisation, Prisma } from '@prisma/client';
import { UpdateDomainNameDto } from './dto/UpdateDomainNameDto';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { Public } from 'src/decorators/Public';

@Controller('organisations')

export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Post()
  @Public()
  async create(@Body() orgnisation: Prisma.OrganisationCreateInput): Promise<Organisation> {
    return await this.organisationsService.create(orgnisation);
  }

  @Patch(':id')
  async updateDomainName(
    @Param('id') id: number,
    @Body() UpdateDomainNameDto: UpdateDomainNameDto,
  ): Promise<Organisation> {
    return await this.organisationsService.updateDomainName(id, UpdateDomainNameDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Organisation> {
    return await this.organisationsService.findOne({id: Number(id)});
  }
}
