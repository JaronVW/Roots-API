import { Controller, Request, Get, Post, UseGuards, Body, Res, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './authentication/guards/local-auth-guard';
import { AuthenticationService } from './authentication/authentication.service';
import { SignUpDto } from './authentication/dto/signUpDto';
import { Public } from './decorators/Public';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Response } from 'express';
import { IsNotEmpty } from 'class-validator';
import { FileNameDto } from './FileNameDto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly authenticationService: AuthenticationService) {}

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
      console.log(user);
      return this.authenticationService.login(user);
    } catch (error) {
      throw error;
    }
  }

  @Get('file/:encryptedFileName')
  getFile(
    @Param('encryptedFileName') encryptedFileName: string,
    @Res() response: Response,
    
    @Query() 
    ofn: FileNameDto,
  ) {
    const file = readFileSync(join(process.cwd(), `upload/${encryptedFileName}`));
    if (ofn.originalFilename.includes('.jpg')) response.contentType('image/jpg');
    response.set('Content-Disposition', 'inline;');

    if (ofn.originalFilename.includes('.png')) response.contentType('image/png');
    response.set('Content-Disposition', 'inline;');
    if (ofn.originalFilename.includes('.jpeg')) response.contentType('image/jpeg');
    response.set('Content-Disposition', 'inline;');

    if (ofn.originalFilename.includes('.mp4')) response.contentType('video/mp4');
    if (ofn.originalFilename.includes('.mp3')) response.contentType('audio/mp3');
    if (ofn.originalFilename.includes('.pdf')) response.contentType('application/pdf');

    response.attachment(ofn.originalFilename);
    response.send(file);
  }
}
