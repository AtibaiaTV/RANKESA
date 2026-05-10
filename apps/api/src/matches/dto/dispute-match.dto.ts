import { IsNotEmpty, IsString } from 'class-validator'

export class DisputeMatchDto {
  @IsString()
  @IsNotEmpty()
  reason: string
}
