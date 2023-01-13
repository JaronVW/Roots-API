import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [TagsController],
  providers: [TagsService, JwtService],
})
export class TagsModule {}
