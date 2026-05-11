import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator'
import { ReportStatus } from '@rank-app/shared'

export class ResolveReportDto {
  @IsEnum([ReportStatus.REVIEWED, ReportStatus.DISMISSED, ReportStatus.ACTED])
  status: ReportStatus.REVIEWED | ReportStatus.DISMISSED | ReportStatus.ACTED

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNotes?: string
}
