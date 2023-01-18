import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { PrismaClientModule } from './prisma-client/prisma-client.module';
import { TagsModule } from './tags/tags.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from './authentication/authentication.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './authentication/guards/jwt-auth.guard';
import { FilesController } from './files/files.controller';
import { UsersController } from './users/users.controller';
import { MailModule } from './mail/mail.module';
import { VerificationRequestService } from './verification-request/verification-request.service';
import { VerificationRequestModule } from './verification-request/verification-request.module';
import { ResetPasswordRequestModule } from './reset-password-request/reset-password-request.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    EventsModule,
    PrismaClientModule,
    TagsModule,
    OrganisationsModule,
    UsersModule,
    AuthenticationModule,
    MailModule,
    VerificationRequestModule,
    ResetPasswordRequestModule,
  ],
  controllers: [AppController, FilesController, UsersController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    VerificationRequestService,
  ],
})
export class AppModule {}
