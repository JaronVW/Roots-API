import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class tagCreateDto {
  @IsString()
  @IsNotEmpty()
  subject: string;
}
