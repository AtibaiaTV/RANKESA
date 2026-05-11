const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

interface FetchOptions extends RequestInit {
  token?: string
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...init } = options
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      let message: string
      try {
        const err = JSON.parse(text)
        message = Array.isArray(err.message) ? err.message[0] : (err.message ?? res.statusText)
      } catch {
        message = text || res.statusText
      }
      throw new Error(message)
    }

    return res.json() as Promise<T>
  } finally {
    clearTimeout(timeout)
  }
}
