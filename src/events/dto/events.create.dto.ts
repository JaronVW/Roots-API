import { CustomTag, Multimedia, Paragraph, Tag } from '@prisma/client';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { multimediaItemsDto } from './multimedia.items.create.dto';
import { paragraphCreateDto } from './paragraph.create.dto';
import { tagCreateDto } from './tag.create.dto';

export class eventsCreateDto {
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
  userId: number | null;

  @IsOptional()
  multimediaItems: multimediaItemsDto[];

  @IsOptional()
  tags: tagCreateDto[];

  @IsOptional()
  customTags: tagCreateDto[];

  @IsOptional()
  paragraphs: paragraphCreateDto[];
}
