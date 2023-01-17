import { Controller, Request, Get, Post, UseGuards, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './authentication/guards/local-auth-guard';
import { AuthenticationService } from './authentication/authentication.service';
import { SignUpDto } from './authentication/dto/signUpDto';
import { Public } from './decorators/Public';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail/mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authenticationService: AuthenticationService,
    private readonly mail: MailService,
  ) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @Public()
  async login(@Request() req: any) {
    return this.authenticationService.login(req.user);
  }

  @Post('auth/register')
  @Public()
  async register(@Body() signUpDto: SignUpDto) {
    try {
      const user = await this.authenticationService.generateUser(signUpDto);
      return this.authenticationService.login(user);
    } catch (error) {
      throw error;
    }
  }

  @Post('testmail')
  @Public()
  testmail() {
    return this.mail.sendMail();
  }
}
