import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import argon2 = require('argon2');
import { OrganisationsService } from 'src/organisations/organisations.service';
import { Console } from 'console';
import { SignUpDto } from './dto/signUpDto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UsersService,
    private readonly organisationsService: OrganisationsService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findOne(username);
      if (user && (await argon2.verify(user.password, password))) {
        const result = { id: user.id, username: user.email };
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async generateUser(signUpDto: SignUpDto): Promise<{ id: number; username: string }> {
    try {
      const organisation = await this.organisationsService
        .findOne({ domainName: signUpDto.username.split('@').pop() })
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
      return { id: data.id, username: data.email };
    } catch (error) {
      if (error.code == 'P2002') throw new BadRequestException('email is already in use');
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Something went wrong');
    }
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
