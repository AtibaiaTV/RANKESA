import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthModule } from './auth/auth.module'
import { PlayersModule } from './players/players.module'
import { MatchesModule } from './matches/matches.module'
import { RankingsModule } from './rankings/rankings.module'
import { BetsModule } from './bets/bets.module'
import { SchedulesModule } from './schedules/schedules.module'
import { AsaasModule } from './asaas/asaas.module'
import { ReportsModule } from './reports/reports.module'
import { BoletasPurchasesModule } from './boletas-purchases/boletas-purchases.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    PlayersModule,
    MatchesModule,
    RankingsModule,
    BetsModule,
    SchedulesModule,
    AsaasModule,
    ReportsModule,
    BoletasPurchasesModule,
  ],
})
export class AppModule {}
