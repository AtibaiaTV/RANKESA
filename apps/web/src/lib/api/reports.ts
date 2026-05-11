import { apiFetch } from './client'
import { Report, ReportCategory, ReportStatus } from '@rank-app/shared'

export function createReport(
  token: string,
  data: { reportedPlayerId: string; matchId?: string; category: ReportCategory; reason: string },
) {
  return apiFetch<Report>('/reports', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  })
}

export function getReports(token: string, status?: ReportStatus) {
  const qs = status ? `?status=${status}` : ''
  return apiFetch<Report[]>(`/reports${qs}`, { token })
}

export function resolveReport(
  token: string,
  id: string,
  data: { status: ReportStatus; adminNotes?: string },
) {
  return apiFetch<Report>(`/reports/${id}/resolve`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  })
}
