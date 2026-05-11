import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'
import { Gender, PlayerLevel, Sport } from '@rank-app/shared'

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsEnum(Sport)
  sport: Sport

  @IsString()
  @IsNotEmpty()
  city: string

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
