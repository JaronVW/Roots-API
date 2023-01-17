import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, IsBoolean } from 'class-validator';

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
  searchQuery = '';

  @IsOptional()
  @Transform(({ value }) => value === 'true') // otherwise every string evaluates to true (even 'false')
  @IsBoolean()
  getArchivedItems = false;
}
