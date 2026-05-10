import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Player, PlayerSchema } from './schemas/player.schema'
import { PlayersService } from './players.service'
import { PlayersController } from './players.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }])],
  providers: [PlayersService],
  controllers: [PlayersController],
  exports: [PlayersService],
})
export class PlayersModule {}
