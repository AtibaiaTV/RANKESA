import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type MatchCommentDocument = HydratedDocument<MatchComment>

@Schema({ timestamps: true })
export class MatchComment {
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true })
  matchRef: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  author: Types.ObjectId

  @Prop({ required: true, maxlength: 600 })
  content: string

  @Prop({ required: true, default: false })
  isAdminMessage: boolean
}

export const MatchCommentSchema = SchemaFactory.createForClass(MatchComment)
MatchCommentSchema.index({ matchRef: 1, createdAt: 1 })
