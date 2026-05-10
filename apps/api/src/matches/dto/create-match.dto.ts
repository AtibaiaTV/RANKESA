import { IsDateString, IsMongoId, IsNotEmpty, IsString } from 'class-validator'

export class CreateMatchDto {
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
