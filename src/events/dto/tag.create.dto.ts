import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class tagCreateDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  subject: string;
}
