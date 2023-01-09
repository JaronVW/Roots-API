import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { PrismaClientModule } from './prisma-client/prisma-client.module';
import { TagsModule } from './tags/tags.module';
import { OrganisationsModule } from './organisations/organisations.module';

@Module({
  imports: [EventsModule, PrismaClientModule, TagsModule, OrganisationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
