const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  accounts: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      return fetchApi<{ data: any[]; total: number; page: number; limit: number }>(`/accounts${qs}`)
    },
    get: (id: string) => fetchApi<any>(`/accounts/${id}`),
    patch: (id: string, data: Record<string, unknown>) =>
      fetchApi<any>(`/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  briefings: {
    get: (accountId: string, force = false) =>
      fetchApi<any>(`/accounts/${accountId}/briefing${force ? '?force=true' : ''}`),
    refresh: (accountId: string) =>
      fetchApi<any>(`/accounts/${accountId}/briefing/refresh`, { method: 'POST' }),
  },
  signals: {
    list: (accountId: string, params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      return fetchApi<any[]>(`/accounts/${accountId}/signals${qs}`)
    },
    acknowledge: (signalId: string) =>
      fetchApi<any>(`/signals/${signalId}/acknowledge`, { method: 'PATCH' }),
    resolve: (signalId: string) =>
      fetchApi<any>(`/signals/${signalId}/resolve`, { method: 'PATCH' }),
  },
  alerts: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      return fetchApi<{ data: any[]; total: number }>(`/alerts${qs}`)
    },
    acknowledge: (alertId: string) =>
      fetchApi<any>(`/alerts/${alertId}/acknowledge`, { method: 'PATCH' }),
    resolve: (alertId: string) =>
      fetchApi<any>(`/alerts/${alertId}/resolve`, { method: 'PATCH' }),
  },
}
