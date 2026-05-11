import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { BOLETAS_REWARDS } from '@rank-app/shared'
import { SchedulesService } from '../schedules.service'
import { PlayersService } from '../../players/players.service'

const NO_RESULT_HOURS = 48

@Injectable()
export class NoResultTask {
  private readonly logger = new Logger(NoResultTask.name)

  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly playersService: PlayersService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSchedules(): Promise<void> {
    const expired = await this.schedulesService.findExpiredWithoutResult(NO_RESULT_HOURS)

    if (expired.length === 0) return

    this.logger.log(`Aplicando penalidade a ${expired.length} agendamento(s) sem resultado`)

    for (const schedule of expired) {
      try {
        await this.playersService.addBoletas(
          String(schedule.organizer),
          BOLETAS_REWARDS.SCHEDULE_NO_RESULT,
        )
        await this.schedulesService.markExpiredCompleted(String(schedule._id))
        this.logger.log(
          `Penalidade por resultado não registrado: organizador ${schedule.organizer} (schedule ${schedule._id})`,
        )
      } catch (err) {
        this.logger.error(`Erro ao processar schedule ${schedule._id}: ${err}`)
      }
    }
  }
}
