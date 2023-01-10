import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import argon2 = require('argon2');

@Injectable()
export class AuthenticationService {
  constructor(private readonly userService: UsersService, private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findOne(username);
      if (user && (await argon2.verify(user.password, password))) {
        const result = { id: user.id, username: user.email };
        console.log('daar');
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(user: any) {
    console.log(user);
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
