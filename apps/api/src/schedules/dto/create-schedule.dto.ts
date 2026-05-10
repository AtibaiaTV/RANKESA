import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { GenderType, MatchType, Sport } from '@tennis-rank/shared'

export class CreateScheduleDto {
  @IsEnum(Sport)
  sport: Sport

  @IsEnum(MatchType)
  matchType: MatchType

  @IsEnum(GenderType)
  genderType: GenderType

  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsOptional()
  description?: string

  @IsDateString()
  date: string

  @IsString()
  @IsNotEmpty()
  time: string

  @IsString()
  @IsNotEmpty()
  location: string

  @IsString()
  @IsNotEmpty()
  city: string

  @IsInt()
  @Min(2)
  @Max(50)
  maxPlayers: number
}
