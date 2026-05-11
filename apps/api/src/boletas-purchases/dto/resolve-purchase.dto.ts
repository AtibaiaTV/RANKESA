import { IsEnum, IsOptional, IsString } from 'class-validator'
import { BoletasPurchaseStatus } from '@rank-app/shared'

export class ResolvePurchaseDto {
  @IsEnum([BoletasPurchaseStatus.APPROVED, BoletasPurchaseStatus.REJECTED])
  status: BoletasPurchaseStatus.APPROVED | BoletasPurchaseStatus.REJECTED

  @IsString()
  @IsOptional()
  adminNotes?: string
}
