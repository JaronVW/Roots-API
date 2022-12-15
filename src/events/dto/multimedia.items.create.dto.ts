import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class multimediaItemsDto {
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
