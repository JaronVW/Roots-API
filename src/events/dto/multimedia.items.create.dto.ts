import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class MultimediaItemsDto {
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
