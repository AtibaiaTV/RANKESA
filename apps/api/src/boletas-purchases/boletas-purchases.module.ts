import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BoletasPurchasesController } from './boletas-purchases.controller'
import { BoletasPurchasesService } from './boletas-purchases.service'
import { BoletasPurchase, BoletasPurchaseSchema } from './schemas/boletas-purchase.schema'
import { PlayersModule } from '../players/players.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BoletasPurchase.name, schema: BoletasPurchaseSchema },
    ]),
    PlayersModule,
  ],
  controllers: [BoletasPurchasesController],
  providers: [BoletasPurchasesService],
})
export class BoletasPurchasesModule {}
