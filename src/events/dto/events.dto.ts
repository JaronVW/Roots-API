import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { multimediaItemsDto } from './multimedia.items.create.dto';
import { tagCreateDto } from './tag.create.dto';

export class eventsCreateDto {
  @IsOptional()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsDateString()
  dateOfEvent: Date;

  @IsOptional()
  multimediaItems: multimediaItemsDto[] = [];

  @IsOptional()
  tags: tagCreateDto[] = [];
}

export class eventsUpdateDto extends PartialType(eventsCreateDto) {
  @IsOptional()
  @IsString()
  override title: string;

  @IsOptional()
  @IsString()
  override description: string;
}
