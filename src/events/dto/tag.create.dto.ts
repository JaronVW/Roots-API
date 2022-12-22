import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TagCreateDto {
  @IsInt()
  @IsOptional()
  id: number;

  @IsString()
  @IsNotEmpty()
  subject: string;
}
