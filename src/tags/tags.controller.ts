import { Controller, Get, Request } from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService, private jwtService: JwtService) {}

  @Get()
  findAll(@Request() req) {
    const decodedJwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]) as any;
    return this.tagsService.findAll();
  }
}
