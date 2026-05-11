import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SubscriptionStatus } from '@rank-app/shared'
import { Player, PlayerDocument } from '../players/schemas/player.schema'
import { AsaasService } from './asaas.service'

@Injectable()
export class TrialExpiryTask {
  private readonly logger = new Logger(TrialExpiryTask.name)

  constructor(
    @InjectModel(Player.name) private readonly playerModel: Model<PlayerDocument>,
    private readonly asaasService: AsaasService,
  ) {}

  /**
   * Roda todos os dias ao meio-dia.
   * Encontra jogadores com trial expirado e cria a assinatura PIX no Asaas.
   */
  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async convertExpiredTrials() {
    const now = new Date()

    const expiredPlayers = await this.playerModel
      .find({
        subscriptionStatus: SubscriptionStatus.TRIAL,
        trialEndsAt: { $lte: now },
        asaasCustomerId: { $exists: true, $ne: null },
      })
      .lean()

    if (expiredPlayers.length === 0) return

    this.logger.log(`Convertendo ${expiredPlayers.length} trial(s) expirado(s) para assinatura`)

    for (const player of expiredPlayers) {
      try {
        const dueDate = now.toISOString().split('T')[0] // YYYY-MM-DD
        const subscription = await this.asaasService.createPixSubscription({
          customerId: player.asaasCustomerId!,
          dueDate,
          description: `Plano RANK — ${player.name}`,
        })

        if (subscription) {
          await this.playerModel.findByIdAndUpdate(player._id, {
            asaasSubscriptionId: subscription.id,
            subscriptionStatus: SubscriptionStatus.OVERDUE, // aguardando 1º pagamento
          })
          this.logger.log(`Assinatura criada para ${player.email}: ${subscription.id}`)
        } else {
          // Asaas não configurado — só marca como INACTIVE para não ficar preso em trial
          await this.playerModel.findByIdAndUpdate(player._id, {
            subscriptionStatus: SubscriptionStatus.INACTIVE,
          })
        }
      } catch (err) {
        this.logger.error(`Falha ao converter trial de ${player.email}`, err)
      }
    }
  }
}
