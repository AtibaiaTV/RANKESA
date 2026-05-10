import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import { BetStatus } from '@rank-app/shared'

export type BetDocument = HydratedDocument<Bet>

@Schema({ timestamps: true })
export class Bet {
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true })
  match: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  bettor: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  predictedWinner: Types.ObjectId

  @Prop({ required: true, min: 1 })
  amount: number

  @Prop({ required: true, enum: BetStatus, default: BetStatus.PENDING })
  status: BetStatus
}

export const BetSchema = SchemaFactory.createForClass(Bet)
BetSchema.index({ match: 1, bettor: 1 }, { unique: true })
BetSchema.index({ bettor: 1, status: 1 })
