import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduledMatch, ScheduledMatchSchema } from './schemas/scheduled-match.schema'
import { SchedulesService } from './schedules.service'
import { SchedulesController } from './schedules.controller'
import { PlayersModule } from '../players/players.module'
import { NoResultTask } from './tasks/no-result.task'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduledMatch.name, schema: ScheduledMatchSchema },
    ]),
    PlayersModule,
  ],
  providers: [SchedulesService, NoResultTask],
  controllers: [SchedulesController],
  exports: [SchedulesService],
})
export class SchedulesModule {}
