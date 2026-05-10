import { IsInt, IsMongoId, Min } from 'class-validator'

export class PlaceBetDto {
  @IsMongoId()
  predictedWinnerId: string

  @IsInt()
  @Min(1)
  amount: number
}
