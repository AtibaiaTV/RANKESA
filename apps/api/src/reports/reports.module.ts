import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Report, ReportSchema } from './schemas/report.schema'
import { ReportsService } from './reports.service'
import { ReportsController } from './reports.controller'
import { PlayersModule } from '../players/players.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    PlayersModule,
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
