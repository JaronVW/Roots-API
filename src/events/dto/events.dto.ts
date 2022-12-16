import { PartialType } from '@nestjs/mapped-types';
import { CustomTag, Multimedia, Paragraph, Tag } from '@prisma/client';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { multimediaItemsDto } from './multimedia.items.create.dto';
import { paragraphCreateDto } from './paragraph.create.dto';
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
  @IsDate()
  dateOfEvent: Date;

  @IsOptional()
  multimediaItems: multimediaItemsDto[] = [];

  @IsOptional()
  tags: tagCreateDto[] = [];

  @IsOptional()
  customTags: tagCreateDto[] = [];

  @IsOptional()
  paragraphs: paragraphCreateDto[] = [];
}

export class eventsUpdateDto extends PartialType(eventsCreateDto) {
  @IsOptional()
  @IsString()
  override title: string;

  @IsOptional()
  @IsString()
  override description: string;
}
