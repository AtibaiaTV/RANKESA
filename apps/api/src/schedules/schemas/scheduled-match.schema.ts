import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import { GenderType, MatchType, ScheduleStatus, Sport } from '@rank-app/shared'

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

  /** Approved participants (includes organizer) */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Player' }], default: [] })
  players: Types.ObjectId[]

  /** Candidates awaiting organizer approval */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Player' }], default: [] })
  pendingPlayers: Types.ObjectId[]

  @Prop({ required: true, enum: ScheduleStatus, default: ScheduleStatus.OPEN })
  status: ScheduleStatus

  @Prop({ required: true, default: false })
  resultRegistered: boolean

  /** MVP votes cast by approved participants after the match */
  @Prop({
    type: [
      {
        voter:   { type: Types.ObjectId, ref: 'Player' },
        nominee: { type: Types.ObjectId, ref: 'Player' },
      },
    ],
    default: [],
  })
  mvpVotes: { voter: Types.ObjectId; nominee: Types.ObjectId }[]

  /** Player elected as MVP after voting is resolved */
  @Prop({ type: Types.ObjectId, ref: 'Player' })
  mvpWinner?: Types.ObjectId

  /** Optional cost sharing — value in BRL per player */
  @Prop({ min: 0 })
  costPerPlayer?: number

  /** PIX key used to collect the cost from players */
  @Prop()
  pixKey?: string

  /** Human-readable description of what the cost covers */
  @Prop()
  costDescription?: string
}

export const ScheduledMatchSchema = SchemaFactory.createForClass(ScheduledMatch)
ScheduledMatchSchema.index({ sport: 1, date: 1 })
ScheduledMatchSchema.index({ city: 1, date: 1 })
ScheduledMatchSchema.index({ status: 1, date: 1 })
