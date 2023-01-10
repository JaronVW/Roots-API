import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { PrismaClientModule } from './prisma-client/prisma-client.module';
import { TagsModule } from './tags/tags.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationService } from './authentication/authentication.service';
import { LocalStrategy } from './authentication/local.strategy';
import { authenticationModule } from './authentication/authentication.module';

@Module({
  imports: [
    EventsModule,
    PrismaClientModule,
    TagsModule,
    OrganisationsModule,
    ConfigModule.forRoot(),
    UsersModule,
    authenticationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
