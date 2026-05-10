'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/api/auth'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { login: setAuth } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { accessToken, player } = await login(form.email, form.password)
      setAuth(player, accessToken)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Entrar</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white rounded-lg py-2.5 font-medium hover:bg-brand-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Não tem conta?{' '}
          <Link href="/register" className="text-brand font-medium hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
