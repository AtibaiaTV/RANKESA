import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PlayerLevel } from '@tennis-rank/shared'

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
}
