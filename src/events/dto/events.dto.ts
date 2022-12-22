import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { multimediaItemsDto } from './multimedia.items.create.dto';
import { tagCreateDto } from './tag.create.dto';
import { Type } from 'class-transformer';

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
  @IsString()
  content = '';

  @IsOptional()
  @IsDateString()
  dateOfEvent: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => multimediaItemsDto)
  multimediaItems: multimediaItemsDto[] = [];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => tagCreateDto)
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
