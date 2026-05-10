import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ConfigService } from '@nestjs/config'
import { MatchesService } from '../matches.service'

@Injectable()
export class AutoConfirmTask {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async run() {
    const hours = this.config.get<number>('AUTO_CONFIRM_HOURS', 48)
    const count = await this.matchesService.autoConfirmExpired(hours)
    if (count > 0) {
      console.warn(`Auto-confirmadas ${count} partida(s) expiradas`)
    }
  }
}
