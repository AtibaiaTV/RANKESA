import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'
import { Gender, PlayerLevel, Sport } from '@tennis-rank/shared'

export class CreatePlayerDto {
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
