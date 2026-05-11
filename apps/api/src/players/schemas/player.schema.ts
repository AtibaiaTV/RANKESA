import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { Gender, PlayerLevel, Sport, SubscriptionStatus, SystemRole } from '@rank-app/shared'

export type PlayerDocument = HydratedDocument<Player>

@Schema({ timestamps: true })
export class Player {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true, lowercase: true })
  email: string

  @Prop()
  avatar?: string

  @Prop({ required: true })
  city: string

  @Prop({ required: true, enum: Sport })
  sport: Sport

  @Prop({ required: true, enum: PlayerLevel, default: PlayerLevel.BEGINNER })
  level: PlayerLevel

  @Prop({ enum: Gender })
  gender?: Gender

  @Prop()
  venue?: string

  @Prop()
  region?: string

  @Prop()
  state?: string

  @Prop({ default: 'Brasil' })
  country?: string

  @Prop()
  birthDate?: Date

  @Prop()
  phone?: string

  @Prop({ required: true, default: 1000 })
  elo: number

  @Prop({ required: true, default: 0 })
  wins: number

  @Prop({ required: true, default: 0 })
  losses: number

  @Prop({ required: true, default: 0 })
  matchesPlayed: number

  @Prop({ required: true, default: 100 })
  boletas: number

  @Prop({ required: true, select: false })
  password: string

  @Prop({ required: true, enum: SystemRole, default: SystemRole.PLAYER })
  role: SystemRole

  /* ── Suspensão / Fair Play ── */
  @Prop({ required: true, default: 0 })
  suspensionCount: number

  @Prop()
  suspendedUntil?: Date

  @Prop({ required: true, default: false })
  flaggedForBan: boolean

  /* ── Asaas / Assinatura ── */
  @Prop()
  asaasCustomerId?: string

  @Prop()
  asaasSubscriptionId?: string

  @Prop({ required: true, enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL })
  subscriptionStatus: SubscriptionStatus

  @Prop()
  trialEndsAt?: Date
}

export const PlayerSchema = SchemaFactory.createForClass(Player)
PlayerSchema.index({ elo: -1 })
PlayerSchema.index({ sport: 1, elo: -1 })
PlayerSchema.index({ city: 1, elo: -1 })
PlayerSchema.index({ state: 1, elo: -1 })
PlayerSchema.index({ country: 1, elo: -1 })
