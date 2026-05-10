import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator'
import { Sport } from '@rank-app/shared'

export class CreateMatchDto {
  @IsEnum(Sport)
  sport: Sport

  @IsMongoId()
  opponentId: string

  @IsMongoId()
  winnerId: string

  @IsString()
  @IsNotEmpty()
  score: string

  @IsDateString()
  date: string
}
