import { Controller, Get, Param, Patch, Req, Request } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('setInactive/:id')
  async setInactive(@Param('id') id: string, @Req() req) {
    return await this.usersService.setInactive(Number(id), req.user.organisationId);
  }

  @Patch('setActive/:id')
  async setActive(@Param('id') id: string, @Req() req) {
    return await this.usersService.setActive(Number(id), req.user.organisationId);
  }

  @Get()
  async findAll(@Request() req) {
    return await this.usersService.getOrganisationUsers(req);
  }
}
