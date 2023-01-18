import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OrganisationsModule } from '../organisations/organisations.module';
import { MailModule } from '../mail/mail.module';
import { AuthenticationController } from './authentication.controller';
import { VerificationRequestModule } from '../verification-request/verification-request.module';
import { ResetPasswordRequestModule } from '../reset-password-request/reset-password-request.module';

@Module({
  imports: [
    UsersModule,
    OrganisationsModule,
    PassportModule,
    VerificationRequestModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
    MailModule,
    ResetPasswordRequestModule,
  ],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy],
  exports: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
