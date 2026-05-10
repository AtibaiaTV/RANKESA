import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { GenderType, MatchType, ScheduleStatus, Sport } from '@rank-app/shared'

export class QuerySchedulesDto {
  @IsEnum(Sport)
  @IsOptional()
  sport?: Sport

  @IsEnum(MatchType)
  @IsOptional()
  matchType?: MatchType

  @IsEnum(GenderType)
  @IsOptional()
  genderType?: GenderType

  @IsEnum(ScheduleStatus)
  @IsOptional()
  status?: ScheduleStatus

  @IsString()
  @IsOptional()
  city?: string

  @IsDateString()
  @IsOptional()
  from?: string

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1

  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20
}
