import { IsNotEmpty, IsString } from 'class-validator';

export class paragraphCreateDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  text: string;
}
