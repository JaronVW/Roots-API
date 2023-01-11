import { Controller, Request, Get, Post, UseGuards, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './authentication/guards/local-auth-guard';
import { AuthenticationService } from './authentication/authentication.service';
import { SignUpDto } from './authentication/dto/signUpDto';

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

  @Post('auth/register')
  async register(@Body() signUpDto: SignUpDto) {
    try {
      const user = await this.authenticationService.generateUser(signUpDto);
      console.log(user);
      return this.authenticationService.login(user);
    } catch (error) {
      throw error;
    }
  }
}
