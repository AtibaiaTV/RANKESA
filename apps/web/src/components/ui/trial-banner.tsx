'use client'

import { SubscriptionStatus } from '@rank-app/shared'
import { Coins, AlertTriangle, XCircle } from 'lucide-react'

interface TrialBannerProps {
  subscriptionStatus: SubscriptionStatus
  trialEndsAt?: string | null
}

function daysRemaining(dateStr: string): number {
  const end  = new Date(dateStr).getTime()
  const now  = Date.now()
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))
}

export function TrialBanner({ subscriptionStatus, trialEndsAt }: TrialBannerProps) {
  if (subscriptionStatus === SubscriptionStatus.ACTIVE) return null

  if (subscriptionStatus === SubscriptionStatus.TRIAL && trialEndsAt) {
    const days = daysRemaining(trialEndsAt)
    const isUrgent = days <= 14

    return (
      <div className={`mx-8 mt-4 flex items-start gap-3 px-5 py-4 border ${
        isUrgent
          ? 'bg-orange-50 border-orange-200'
          : 'bg-brand/5 border-brand/10'
      }`}>
        <Coins size={16} className={`mt-0.5 shrink-0 ${isUrgent ? 'text-orange-500' : 'text-brand/50'}`} />
        <div className="flex-1 min-w-0">
          {days > 0 ? (
            <>
              <p className={`text-sm font-bold ${isUrgent ? 'text-orange-700' : 'text-gray-800'}`}>
                {days} {days === 1 ? 'dia' : 'dias'} de período gratuito restante{days !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Após o trial, a assinatura mensal de R$&nbsp;19,90 via PIX será gerada automaticamente.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-orange-700">Período gratuito encerrado</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Seu link de pagamento PIX será enviado em breve. Qualquer dúvida, entre em contato.
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  if (subscriptionStatus === SubscriptionStatus.OVERDUE) {
    return (
      <div className="mx-8 mt-4 flex items-start gap-3 px-5 py-4 bg-orange-50 border border-orange-200">
        <AlertTriangle size={16} className="text-orange-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-orange-700">Pagamento pendente</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Você tem um PIX em aberto de R$&nbsp;19,90. Efetue o pagamento para manter o perfil ativo no ranking.
          </p>
        </div>
      </div>
    )
  }

  if (subscriptionStatus === SubscriptionStatus.INACTIVE) {
    return (
      <div className="mx-8 mt-4 flex items-start gap-3 px-5 py-4 bg-red-50 border border-red-200">
        <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-red-700">Assinatura inativa</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Seu perfil está oculto no ranking. Entre em contato para reativar sua conta.
          </p>
        </div>
      </div>
    )
  }

  return null
}
