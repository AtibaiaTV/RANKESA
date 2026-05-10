import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Bet, BetSchema } from './schemas/bet.schema'
import { BetsService } from './bets.service'
import { BetsController } from './bets.controller'
import { MyBetsController } from './my-bets.controller'
import { Match, MatchSchema } from '../matches/schemas/match.schema'
import { Player, PlayerSchema } from '../players/schemas/player.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bet.name, schema: BetSchema },
      { name: Match.name, schema: MatchSchema },
      { name: Player.name, schema: PlayerSchema },
    ]),
  ],
  providers: [BetsService],
  controllers: [BetsController, MyBetsController],
  exports: [BetsService],
})
export class BetsModule {}
