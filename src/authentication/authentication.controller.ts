import { Body, Controller, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { Public } from '../decorators/Public';
import { SignUpDto } from './dto/signUpDto';
import { LocalAuthGuard } from './guards/local-auth-guard';
import { MailService } from '../mail/mail.service';
import { AuthenticationService } from './authentication.service';
import { EmailDto } from './dto/emailDto';
import { ResetPasswordDto } from './dto/resetPasswordDto';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService, private readonly mail: MailService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Public()
  async login(@Request() req: any) {
    return this.authenticationService.login(req.user);
  }

  @Post('register')
  @Public()
  async register(@Body() signUpDto: SignUpDto) {
    return await this.authenticationService.generateUser(signUpDto);
  }

  @Patch('verify/:token')
  @Public()
  async verify(@Param() token: { token: string }) {
    return await this.authenticationService
      .verifyAccount(token.token)
      .then(() => {
        return { statusCode: 200, message: 'Account verified' };
      })
      .catch((error) => {
        throw error;
      });
  }

  @Post('reset-password')
  @Public()
  async resetPassword(@Body() dto: EmailDto) {
    return await this.authenticationService.resetPasswordSendMail(dto.email);
  }

  @Post('reset-password/:token')
  @Public()
  async resetPasswordWithToken(@Param() token: { token: string }, @Body() dto: ResetPasswordDto) {
    return await this.authenticationService.resetPassword(token.token, dto.password);
  }
}
