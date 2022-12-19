import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { PrismaClientModule } from './prisma-client/prisma-client.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [EventsModule, PrismaClientModule, TagsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
