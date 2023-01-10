import { Controller, Request, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './authentication/guards/local-auth-guard';
import { AuthenticationService } from './authentication/authentication.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly authenticationService: AuthenticationService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req: any) {
    return this.authenticationService.login(req.user);
  }
}
