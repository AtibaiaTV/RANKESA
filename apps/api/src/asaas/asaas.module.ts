import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AsaasService } from './asaas.service'
import { AsaasController } from './asaas.controller'
import { TrialExpiryTask } from './trial-expiry.task'
import { Player, PlayerSchema } from '../players/schemas/player.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
  ],
  controllers: [AsaasController],
  providers: [AsaasService, TrialExpiryTask],
  exports: [AsaasService],
})
export class AsaasModule {}
