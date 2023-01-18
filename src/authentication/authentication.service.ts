import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import argon2 = require('argon2');
import { OrganisationsService } from '../organisations/organisations.service';
import { SignUpDto } from './dto/signUpDto';
import { PrismaClientService } from '../prisma-client/prisma-client.service';
import randomString = require('randomstring');
import { MailService } from '../mail/mail.service';
import { VerificationRequestService } from '../verification-request/verification-request.service';
import { DateTime } from 'luxon';
import { ResetPasswordRequestService } from '../reset-password-request/reset-password-request.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UsersService,
    private readonly organisationsService: OrganisationsService,
    private jwtService: JwtService,
    private readonly Prisma: PrismaClientService,
    private readonly mailService: MailService,
    private readonly verificationRequestService: VerificationRequestService,
    private readonly resetPasswordRequestService: ResetPasswordRequestService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (user && (await argon2.verify(user.password, password))) {
      if (!user.isActive) throw new UnauthorizedException('Account is inactive');
      const result = { id: user.id, username: user.email, organisationId: user.organisationId };
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async generateUser(signUpDto: SignUpDto): Promise<string> {
    try {
      const organisation = await this.organisationsService
        .findOne({ domainName: signUpDto.username.split('@').pop().toLowerCase() })
        .catch(() => {
          throw new NotFoundException('Organisation not found');
        });
      const hash = await argon2.hash(signUpDto.password);
      const data = await this.userService.create({
        email: signUpDto.username,
        password: hash,
        firstName: signUpDto.firstName,
        lastName: signUpDto.lastName,
        organisation: { connect: { id: organisation.id } },
      });
      if (data != null) {
        const token = randomString.generate({ length: 128 });
        await this.verificationRequestService.createRequest(
          data.email,
          token,
          DateTime.now().plus({ minutes: 30 }).toJSDate(),
        );
        return await this.mailService.sendVerificationMail({
          to: data.email,
          verificationCode: token,
        });
      }
    } catch (error) {
      // console.log(error);
      if (error.code == 'P2002') throw new BadRequestException('email is already in use');
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Something went wrong');
    }
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, organisationId: user.organisationId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyAccount(token: string) {
    this.verificationRequestService.getPasswordRequest(token).then((data) => {
      if (data == null) throw new NotFoundException('Verification token not found');
      // if (data.expires < new Date()) throw new BadRequestException('Verification token expired');
      if (this.userService.update(data.email)) {
        return;
        // this.verificationRequestService.deleteRequest(data.email);
      }
    });
  }

  async resetPasswordSendMail(email: string) {
    try {
      const token = randomString.generate({ length: 128 });
      // console.log(token);
      await this.resetPasswordRequestService.generatePasswordRequest(
        email,
        token,
        DateTime.now().plus({ minutes: 30 }).toJSDate(),
      );
      await this.mailService.sendPasswordResetMail({ to: email, verificationCode: token });
      return { statucCode: 200, message: 'Mail sent' };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Something went wrong');
    }
  }

  async resetPassword(token: string, password: string) {
    try {
      const data = await this.resetPasswordRequestService.getEmail(token);
      if (data == null) throw new NotFoundException('Token not found');
      if (data.expires < new Date()) throw new BadRequestException('Token expired');
      const hash = await argon2.hash(password);
      await this.userService.updatePassword(data.email, hash);
      await this.resetPasswordRequestService.deleteRequest(data.email);
      return { statucCode: 200, message: 'Password changed' };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Something went wrong');
    }
  }
}
