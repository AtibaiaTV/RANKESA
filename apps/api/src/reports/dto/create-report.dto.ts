import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ReportCategory } from '@rank-app/shared'

export class CreateReportDto {
  @IsMongoId()
  reportedPlayerId: string

  @IsOptional()
  @IsMongoId()
  matchId?: string

  @IsEnum(ReportCategory)
  category: ReportCategory

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string
}
