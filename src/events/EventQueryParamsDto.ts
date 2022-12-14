import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches } from 'class-validator';

export class EventQueryParamsDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  min = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  max = 10;

  @IsOptional()
  @IsString()
  @Matches(/^(asc|desc)$/)
  order = 'desc';
}
