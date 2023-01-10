import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserLoginDto {
  
  
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  public username: string;

  @IsNotEmpty()
  @IsString()
  public password: string;
}
