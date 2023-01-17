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
        template: './welcome',
        context: {
          to: dto.to,
          verificationCode: dto.verificationCode,
        },
      });
      return "Mail sent!"
    } catch (error) {
      throw error;
    }
  }
}
