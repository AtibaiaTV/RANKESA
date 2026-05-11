import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { GenderType, MatchType, Sport } from '@rank-app/shared'

export class UpdateScheduleDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsDateString()
  @IsOptional()
  date?: string

  @IsString()
  @IsOptional()
  time?: string

  @IsString()
  @IsOptional()
  location?: string

  @IsString()
  @IsOptional()
  city?: string

  @IsInt()
  @Min(2)
  @Max(50)
  @IsOptional()
  maxPlayers?: number

  @IsEnum(Sport)
  @IsOptional()
  sport?: Sport

  @IsEnum(MatchType)
  @IsOptional()
  matchType?: MatchType

  @IsEnum(GenderType)
  @IsOptional()
  genderType?: GenderType

  @IsNumber()
  @Min(0)
  @Max(10000)
  @IsOptional()
  costPerPlayer?: number

  @IsString()
  @IsOptional()
  pixKey?: string

  @IsString()
  @IsOptional()
  costDescription?: string
}
