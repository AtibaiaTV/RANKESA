import { apiFetch } from './client'
import { BoletasPackage, BoletasPurchase, BoletasPurchaseStatus } from '@rank-app/shared'

export function createPurchase(token: string, data: {
  package: BoletasPackage
  transactionRef?: string
}) {
  return apiFetch<BoletasPurchase>('/boletas-purchases', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  })
}

export function getMyPurchases(token: string) {
  return apiFetch<BoletasPurchase[]>('/boletas-purchases/mine', { token })
}

export function cancelPurchase(token: string, id: string) {
  return apiFetch<void>(`/boletas-purchases/${id}`, { method: 'DELETE', token })
}

export function adminGetPurchases(token: string, status?: BoletasPurchaseStatus) {
  const qs = status ? `?status=${status}` : ''
  return apiFetch<BoletasPurchase[]>(`/boletas-purchases${qs}`, { token })
}

export function adminResolvePurchase(
  token: string,
  id: string,
  data: { status: BoletasPurchaseStatus; adminNotes?: string },
) {
  return apiFetch<BoletasPurchase>(`/boletas-purchases/${id}/resolve`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  })
}
