import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerificationMailDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  verificationCode: string;
}
