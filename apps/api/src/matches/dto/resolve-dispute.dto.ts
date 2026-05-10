import { IsMongoId } from 'class-validator'

export class ResolveDisputeDto {
  @IsMongoId()
  winnerId: string
}
