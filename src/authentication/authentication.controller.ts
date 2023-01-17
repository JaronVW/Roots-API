import { Body, Controller, Param, Post, Request, UseGuards } from '@nestjs/common';
import { Public } from 'src/decorators/Public';
import { SignUpDto } from './dto/signUpDto';
import { LocalAuthGuard } from './guards/local-auth-guard';
import { MailService } from 'src/mail/mail.service';
import { AuthenticationService } from './authentication.service';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly mail: MailService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Public()
  async login(@Request() req: any) {
    return this.authenticationService.login(req.user);
  }

  @Post('register')
  @Public()
  async register(@Body() signUpDto: SignUpDto) {
    try {
      const user = await this.authenticationService.generateUser(signUpDto);
      console.log(user);
      // return this.authenticationService.login(user);
    } catch (error) {
      throw error;
    }
  }

    @Post('verify/:token')
    @Public()
    async verify(@Param() token: string) {
      try {
        const user = await this.authenticationService.verifyAccount(token);
        return this.authenticationService.login(user);
      } catch (error) {
        throw error;
      }
    }
}
