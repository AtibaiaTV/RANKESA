import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { Gender, PlayerLevel, Sport } from '@rank-app/shared'

export class UpdatePlayerDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsEnum(Sport)
  @IsOptional()
  sport?: Sport

  @IsString()
  @IsOptional()
  city?: string

  @IsEnum(PlayerLevel)
  @IsOptional()
  level?: PlayerLevel

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender

  @IsString()
  @IsOptional()
  avatar?: string

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

  @IsDateString()
  @IsOptional()
  birthDate?: string
}
