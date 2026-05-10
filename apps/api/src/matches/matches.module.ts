import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Match, MatchSchema } from './schemas/match.schema'
import { MatchesService } from './matches.service'
import { MatchesController } from './matches.controller'
import { AutoConfirmTask } from './tasks/auto-confirm.task'
import { PlayersModule } from '../players/players.module'
import { MailModule } from '../mail/mail.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    PlayersModule,
    MailModule,
  ],
  providers: [MatchesService, AutoConfirmTask],
  controllers: [MatchesController],
  exports: [MatchesService],
})
export class MatchesModule {}
