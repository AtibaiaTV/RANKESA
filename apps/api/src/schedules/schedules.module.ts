import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduledMatch, ScheduledMatchSchema } from './schemas/scheduled-match.schema'
import { SchedulesService } from './schedules.service'
import { SchedulesController } from './schedules.controller'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduledMatch.name, schema: ScheduledMatchSchema },
    ]),
  ],
  providers: [SchedulesService],
  controllers: [SchedulesController],
})
export class SchedulesModule {}
