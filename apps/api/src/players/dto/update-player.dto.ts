import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator'
import { PlayerLevel, Sport } from '@tennis-rank/shared'

export class UpdatePlayerDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  city?: string

  @IsEnum(PlayerLevel)
  @IsOptional()
  level?: PlayerLevel

  @IsString()
  @IsOptional()
  avatar?: string

  @IsArray()
  @IsEnum(Sport, { each: true })
  @IsOptional()
  sports?: Sport[]
}
