import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class paragraphCreateDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsNumber()
  eventId?: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  text: string;
}
