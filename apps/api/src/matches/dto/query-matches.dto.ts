import { IsEnum, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { MatchStatus } from '@tennis-rank/shared'

export class QueryMatchesDto {
  @IsMongoId()
  @IsOptional()
  playerId?: string

  @IsEnum(MatchStatus)
  @IsOptional()
  status?: MatchStatus

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
