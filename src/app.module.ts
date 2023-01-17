import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { PrismaClientModule } from './prisma-client/prisma-client.module';
import { TagsModule } from './tags/tags.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { authenticationModule } from './authentication/authentication.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './authentication/guards/jwt-auth.guard';
import { FilesController } from './files/files.controller';
import { UsersController } from './users/users.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailModule } from './mail/mail.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    EventsModule,
    PrismaClientModule,
    TagsModule,
    OrganisationsModule,
    UsersModule,
    authenticationModule,
    MailModule,
  ],
  controllers: [AppController, FilesController, UsersController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
