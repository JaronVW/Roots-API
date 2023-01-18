import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { MultimediaItemsDto } from './multimedia.items.create.dto';
import { TagCreateDto } from './tag.create.dto';
import { Type } from 'class-transformer';

export class EventsCreateDto {
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
  @IsString()
  content: string;

  @IsOptional()
  @IsDateString()
  dateOfEvent: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => MultimediaItemsDto)
  multimediaItems: MultimediaItemsDto[] = [];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TagCreateDto)
  tags: TagCreateDto[] = [];

  @IsOptional()
  @IsNumber()
  organisationId: number;
}

export class EventsUpdateDto extends PartialType(EventsCreateDto) {
  @IsOptional()
  @IsString()
  override title: string;

  @IsOptional()
  @IsString()
  override description: string;
}
