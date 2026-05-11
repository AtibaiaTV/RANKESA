import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface AsaasCustomer {
  id: string
  name: string
  email: string
  cpfCnpj?: string
}

interface AsaasSubscription {
  id: string
  customer: string
  billingType: string
  value: number
  nextDueDate: string
  status: string
}

@Injectable()
export class AsaasService {
  private readonly logger = new Logger(AsaasService.name)
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor(private readonly config: ConfigService) {
    this.baseUrl = config.get<string>('ASAAS_BASE_URL', 'https://api.asaas.com/v3')
    this.apiKey  = config.get<string>('ASAAS_API_KEY', '')
  }

  private get isConfigured(): boolean {
    return !!this.apiKey
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'access_token': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Asaas ${method} ${path} → ${res.status}: ${text}`)
    }

    return res.json() as Promise<T>
  }

  /**
   * Cria (ou recupera) um cliente Asaas para o jogador.
   * Retorna null se a integração não estiver configurada.
   */
  async createCustomer(data: {
    name: string
    email: string
    cpfCnpj?: string
  }): Promise<AsaasCustomer | null> {
    if (!this.isConfigured) {
      this.logger.warn('ASAAS_API_KEY não configurado — criação de cliente ignorada')
      return null
    }
    try {
      return await this.request<AsaasCustomer>('POST', '/customers', {
        name: data.name,
        email: data.email,
        cpfCnpj: data.cpfCnpj,
      })
    } catch (err) {
      this.logger.error('Falha ao criar cliente Asaas', err)
      return null
    }
  }

  /**
   * Cria assinatura mensal via PIX de R$19,90.
   * dueDate = data do primeiro vencimento (hoje + 1 dia, em geral).
   */
  async createPixSubscription(data: {
    customerId: string
    dueDate: string   // formato YYYY-MM-DD
    description?: string
  }): Promise<AsaasSubscription | null> {
    if (!this.isConfigured) {
      this.logger.warn('ASAAS_API_KEY não configurado — criação de assinatura ignorada')
      return null
    }
    try {
      return await this.request<AsaasSubscription>('POST', '/subscriptions', {
        customer: data.customerId,
        billingType: 'PIX',
        value: 19.90,
        nextDueDate: data.dueDate,
        cycle: 'MONTHLY',
        description: data.description ?? 'Plano RANK — Assinatura Mensal',
      })
    } catch (err) {
      this.logger.error('Falha ao criar assinatura Asaas', err)
      return null
    }
  }
}
