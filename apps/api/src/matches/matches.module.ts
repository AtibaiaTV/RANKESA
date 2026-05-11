import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Match, MatchSchema } from './schemas/match.schema'
import { MatchComment, MatchCommentSchema } from './schemas/match-comment.schema'
import { MatchesService } from './matches.service'
import { MatchesController } from './matches.controller'
import { AutoConfirmTask } from './tasks/auto-confirm.task'
import { PlayersModule } from '../players/players.module'
import { MailModule } from '../mail/mail.module'
import { BetsModule } from '../bets/bets.module'
import { SchedulesModule } from '../schedules/schedules.module'
import { ReportsModule } from '../reports/reports.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: MatchComment.name, schema: MatchCommentSchema },
    ]),
    PlayersModule,
    MailModule,
    BetsModule,
    SchedulesModule,
    ReportsModule,
  ],
  providers: [MatchesService, AutoConfirmTask],
  controllers: [MatchesController],
  exports: [MatchesService],
})
export class MatchesModule {}
