import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import { ReportCategory, ReportStatus } from '@rank-app/shared'

export type ReportDocument = HydratedDocument<Report>

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  reporter: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  reportedPlayer: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Match' })
  matchRef?: Types.ObjectId

  @Prop({ required: true, enum: ReportCategory })
  category: ReportCategory

  @Prop({ required: true })
  reason: string

  @Prop({ required: true, enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus

  @Prop({ required: true, default: 1 })
  offenseNumber: number

  @Prop()
  suspensionDays?: number

  @Prop()
  adminNotes?: string
}

export const ReportSchema = SchemaFactory.createForClass(Report)
ReportSchema.index({ status: 1, createdAt: -1 })
ReportSchema.index({ reportedPlayer: 1, createdAt: -1 })
