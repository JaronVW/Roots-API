import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class MultimediaItemsDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  path: string;

  @IsNotEmpty()
  @IsString()
  multimedia: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  transcript: string;

  @IsOptional()
  @IsString()
  alt: string;
}
