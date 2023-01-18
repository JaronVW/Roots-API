import { Body, Controller, Get, Param, Patch, Post, Render, Request, UseGuards } from '@nestjs/common';
import { Public } from 'src/decorators/Public';
import { SignUpDto } from './dto/signUpDto';
import { LocalAuthGuard } from './guards/local-auth-guard';
import { MailService } from 'src/mail/mail.service';
import { AuthenticationService } from './authentication.service';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { emailDto } from './dto/emailDto';
import { resetPasswordDto } from './dto/resetPasswordDto';

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
    try {
      const user = await this.authenticationService.generateUser(signUpDto);
      console.log(user);
      // return this.authenticationService.login(user);
    } catch (error) {
      throw error;
    }
  }

  @Patch('verify/:token')
  @Public()
  async verify(@Param() token: { token: string }) {
    try {
      return await this.authenticationService
        .verifyAccount(token.token)
        .then(() => {
          return { message: 'Account verified!' };
        })
        .catch(() => {
          return { message: 'Something went wrong while verifying your account' };
        });
    } catch (error) {
      throw error;
    }
  }

  @Post('reset-password')
  @Public()
  async resetPassword(@Body() dto: emailDto) {
    try {
      return await this.authenticationService.resetPasswordSendMail(dto.email);
    } catch (error) {
      throw error;
    }
  }

  @Post('reset-password/:token')
  @Public()
  async resetPasswordWithToken(@Param() token: { token: string }, @Body() dto: resetPasswordDto) {
    try {
      return await this.authenticationService.resetPassword(token.token, dto.password);
    } catch (error) {
      throw error;
    }
  }
}
