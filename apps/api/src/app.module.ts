import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthModule } from './auth/auth.module'
import { PlayersModule } from './players/players.module'
import { MatchesModule } from './matches/matches.module'
import { RankingsModule } from './rankings/rankings.module'

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
  ],
})
export class AppModule {}
