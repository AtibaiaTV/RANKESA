import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import { GenderType, MatchType, ScheduleStatus, Sport } from '@tennis-rank/shared'

export type ScheduledMatchDocument = HydratedDocument<ScheduledMatch>

@Schema({ timestamps: true })
export class ScheduledMatch {
  @Prop({ required: true, enum: Sport })
  sport: Sport

  @Prop({ required: true, enum: MatchType })
  matchType: MatchType

  @Prop({ required: true, enum: GenderType })
  genderType: GenderType

  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  organizer: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop()
  description?: string

  @Prop({ required: true })
  date: Date

  @Prop({ required: true })
  time: string

  @Prop({ required: true })
  location: string

  @Prop({ required: true })
  city: string

  @Prop({ required: true, min: 2 })
  maxPlayers: number

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Player' }], default: [] })
  players: Types.ObjectId[]

  @Prop({ required: true, enum: ScheduleStatus, default: ScheduleStatus.OPEN })
  status: ScheduleStatus
}

export const ScheduledMatchSchema = SchemaFactory.createForClass(ScheduledMatch)
ScheduledMatchSchema.index({ sport: 1, date: 1 })
ScheduledMatchSchema.index({ city: 1, date: 1 })
ScheduledMatchSchema.index({ status: 1, date: 1 })
