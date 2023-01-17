import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail() {
    try {
      await this.mailerService.sendMail({
        to: 'jaron.do14@gmail.com',
        from: 'noreply@Roots.com',
        subject: 'Testing Nest MailerModule ✔',
        template: './welcome',
        context: {
          message: 'Welcome to Roots!',
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
