import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class tagCreateDto {
  @IsInt()
  @IsOptional()
  id: number;

  @IsString()
  @IsNotEmpty()
  subject: string;
}
