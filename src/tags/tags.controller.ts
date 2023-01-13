import { Controller, Get, Request } from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtService } from '@nestjs/jwt';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService, private jwtService: JwtService) {}

  @Get()
  findAll(@Request() req) {
    const decodedJwt = (this.jwtService.decode(req.headers.authorization.split(' ')[1]) as any) || {
      organisationId: null,
    };
    return this.tagsService.findAll();
  }
}
