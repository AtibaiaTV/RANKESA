import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import { MatchStatus, Sport } from '@rank-app/shared'

export type MatchDocument = HydratedDocument<Match>

@Schema({ timestamps: true })
export class Match {
  @Prop({ required: true, enum: Sport })
  sport: Sport

  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  player1: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  player2: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  winner: Types.ObjectId

  @Prop({ required: true })
  score: string

  @Prop({ required: true })
  date: Date

  @Prop({ required: true, enum: MatchStatus, default: MatchStatus.PENDING_REVIEW })
  status: MatchStatus

  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  registeredBy: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Player' })
  disputedBy?: Types.ObjectId

  @Prop()
  disputeReason?: string

  @Prop()
  confirmedAt?: Date

  @Prop({ default: false })
  eloApplied: boolean
}

export const MatchSchema = SchemaFactory.createForClass(Match)
MatchSchema.index({ sport: 1, createdAt: -1 })
MatchSchema.index({ player1: 1, createdAt: -1 })
MatchSchema.index({ player2: 1, createdAt: -1 })
MatchSchema.index({ status: 1, createdAt: 1 })
