import { Body, Controller, Headers, HttpCode, Logger, Post, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SubscriptionStatus } from '@rank-app/shared'
import { Player, PlayerDocument } from '../players/schemas/player.schema'

interface AsaasWebhookPayload {
  event: string
  payment?: {
    subscription?: string
    status?: string
  }
  subscription?: {
    id?: string
    status?: string
  }
}

@Controller('webhooks/asaas')
export class AsaasController {
  private readonly logger = new Logger(AsaasController.name)

  constructor(
    private readonly config: ConfigService,
    @InjectModel(Player.name) private readonly playerModel: Model<PlayerDocument>,
  ) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Body() payload: AsaasWebhookPayload,
    @Headers('asaas-access-token') token: string,
  ) {
    // Valida o token de webhook se configurado
    const expectedToken = this.config.get<string>('ASAAS_WEBHOOK_TOKEN', '')
    if (expectedToken && token !== expectedToken) {
      throw new UnauthorizedException('Token de webhook inválido')
    }

    const { event } = payload
    this.logger.log(`Webhook Asaas recebido: ${event}`)

    const subscriptionId =
      payload.subscription?.id ??
      payload.payment?.subscription

    if (!subscriptionId) return { received: true }

    switch (event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        await this.playerModel.findOneAndUpdate(
          { asaasSubscriptionId: subscriptionId },
          { subscriptionStatus: SubscriptionStatus.ACTIVE },
        )
        break

      case 'PAYMENT_OVERDUE':
        await this.playerModel.findOneAndUpdate(
          { asaasSubscriptionId: subscriptionId },
          { subscriptionStatus: SubscriptionStatus.OVERDUE },
        )
        break

      case 'SUBSCRIPTION_DELETED':
      case 'PAYMENT_DELETED':
        await this.playerModel.findOneAndUpdate(
          { asaasSubscriptionId: subscriptionId },
          { subscriptionStatus: SubscriptionStatus.INACTIVE },
        )
        break

      default:
        this.logger.debug(`Evento não tratado: ${event}`)
    }

    return { received: true }
  }
}
