import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsBooleanString, IsInt, IsOptional, IsString, Matches } from 'class-validator';

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

  @IsOptional()
  @IsString()
  searchQuery: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  getArchivedItems: boolean;
}
