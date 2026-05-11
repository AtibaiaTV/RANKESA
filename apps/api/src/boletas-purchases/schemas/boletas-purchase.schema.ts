import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import { BoletasPackage, BoletasPurchaseStatus } from '@rank-app/shared'

export type BoletasPurchaseDocument = HydratedDocument<BoletasPurchase>

@Schema({ timestamps: true })
export class BoletasPurchase {
  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  player: Types.ObjectId

  @Prop({ required: true, enum: BoletasPackage })
  package: BoletasPackage

  @Prop({ required: true })
  boletas: number

  @Prop({ required: true })
  price: number

  @Prop({ required: true, enum: BoletasPurchaseStatus, default: BoletasPurchaseStatus.PENDING })
  status: BoletasPurchaseStatus

  /** Transaction reference submitted by the player */
  @Prop()
  transactionRef?: string

  @Prop()
  adminNotes?: string
}

export const BoletasPurchaseSchema = SchemaFactory.createForClass(BoletasPurchase)
BoletasPurchaseSchema.index({ player: 1, createdAt: -1 })
BoletasPurchaseSchema.index({ status: 1, createdAt: -1 })
