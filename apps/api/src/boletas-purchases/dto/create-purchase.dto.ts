import { IsEnum, IsOptional, IsString } from 'class-validator'
import { BoletasPackage } from '@rank-app/shared'

export class CreatePurchaseDto {
  @IsEnum(BoletasPackage)
  package: BoletasPackage

  /** Optional PIX transaction ID / reference provided by the player */
  @IsString()
  @IsOptional()
  transactionRef?: string
}
