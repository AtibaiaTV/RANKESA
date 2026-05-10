import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'
import { PlayerLevel } from '@tennis-rank/shared'

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  @IsNotEmpty()
  city: string

  @IsEnum(PlayerLevel)
  @IsOptional()
  level?: PlayerLevel
}
