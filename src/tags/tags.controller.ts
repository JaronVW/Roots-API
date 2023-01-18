import { Controller, Get, Request } from '@nestjs/common';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(@Request() req) {
    return this.tagsService.findAll(req.user.organisationId);
  }
}
