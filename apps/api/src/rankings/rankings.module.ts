import { Module } from '@nestjs/common'
import { RankingsController } from './rankings.controller'
import { PlayersModule } from '../players/players.module'

@Module({
  imports: [PlayersModule],
  controllers: [RankingsController],
})
export class RankingsModule {}
