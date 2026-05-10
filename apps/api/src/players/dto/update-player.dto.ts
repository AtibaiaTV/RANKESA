import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator'
import { Gender, PlayerLevel, Sport } from '@tennis-rank/shared'

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

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender

  @IsString()
  @IsOptional()
  avatar?: string

  @IsArray()
  @IsEnum(Sport, { each: true })
  @IsOptional()
  sports?: Sport[]
}
