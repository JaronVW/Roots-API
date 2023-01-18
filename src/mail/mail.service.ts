import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { VerificationMailDto } from './verificationMailDto';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationMail(dto: VerificationMailDto) {
    try {
      await this.mailerService.sendMail({
        to: dto.to,
        from: 'noreply@Roots.com',
        subject: 'Verifiëer uw account',
        template: './verificationEmailTemplate',
        context: {
          to: dto.to,
          verificationLink: `${process.env.BASE_URL}/auth/verify/${dto.verificationCode}`,
        },
      });
      return 'Mail sent!';
    } catch (error) {
      // console.log(error);
      throw error;
    }
  }

  async sendPasswordResetMail(dto: VerificationMailDto) {
    try {
      await this.mailerService.sendMail({
        to: dto.to,
        from: 'noreply@Roots.com',
        subject: 'Reset uw wachtwoord',
        template: './passwordResetEmailTemplate',
        context: {
          to: dto.to,
          verificationLink: `${process.env.BASE_URL_CLIENT}/passwordreset/${dto.verificationCode}`,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
