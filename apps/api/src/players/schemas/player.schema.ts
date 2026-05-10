import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { PlayerLevel, SystemRole } from '@tennis-rank/shared'

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

  @Prop({ required: true, enum: PlayerLevel, default: PlayerLevel.BEGINNER })
  level: PlayerLevel

  @Prop({ required: true, default: 1000 })
  elo: number

  @Prop({ required: true, default: 0 })
  wins: number

  @Prop({ required: true, default: 0 })
  losses: number

  @Prop({ required: true, default: 0 })
  matchesPlayed: number

  @Prop({ required: true, select: false })
  password: string

  @Prop({ required: true, enum: SystemRole, default: SystemRole.PLAYER })
  role: SystemRole
}

export const PlayerSchema = SchemaFactory.createForClass(Player)
PlayerSchema.index({ elo: -1 })
PlayerSchema.index({ city: 1, elo: -1 })
