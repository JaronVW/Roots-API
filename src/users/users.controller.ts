import { Controller, Get, Param, Patch, Req, Request } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('setInactive/:id')
  async setInactive(@Param('id') id: string) {
    return await this.usersService.setInactive(Number(id));
  }

  @Patch('setActive/:id')
  async setActive(@Param('id') id: string) {
    return await this.usersService.setActive(Number(id));
  }

  @Get()
  async findAll(@Request() req) {
    return await this.usersService.getOranisationUsers(req);
  }
}
