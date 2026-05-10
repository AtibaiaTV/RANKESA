import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { Gender, PlayerLevel, Sport } from '@rank-app/shared'

export class QueryPlayersDto {
  @IsEnum(Sport)
  @IsOptional()
  sport?: Sport

  @IsString()
  @IsOptional()
  city?: string

  @IsString()
  @IsOptional()
  venue?: string

  @IsString()
  @IsOptional()
  region?: string

  @IsString()
  @IsOptional()
  state?: string

  @IsString()
  @IsOptional()
  country?: string

  @IsEnum(PlayerLevel)
  @IsOptional()
  level?: PlayerLevel

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender

  @IsInt()
  @Min(1)
  @Max(120)
  @Type(() => Number)
  @IsOptional()
  minAge?: number

  @IsInt()
  @Min(1)
  @Max(120)
  @Type(() => Number)
  @IsOptional()
  maxAge?: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20
}
