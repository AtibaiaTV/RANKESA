'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register } from '@/lib/api/auth'
import { useAuth } from '@/contexts/auth-context'
import { Gender, PlayerLevel } from '@rank-app/shared'

const LEVEL_OPTIONS = [
  { value: PlayerLevel.BEGINNER, label: 'Iniciante' },
  { value: PlayerLevel.INTERMEDIATE, label: 'Intermediário' },
  { value: PlayerLevel.ADVANCED, label: 'Avançado' },
]

const GENDER_OPTIONS = [
  { value: '', label: 'Prefiro não informar' },
  { value: Gender.MALE, label: 'Masculino' },
  { value: Gender.FEMALE, label: 'Feminino' },
]

export default function RegisterPage() {
  const router = useRouter()
  const { login: setAuth } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    level: PlayerLevel.BEGINNER,
    gender: '' as Gender | '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { accessToken, player } = await register(form)
      setAuth(player, accessToken)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Criar conta</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Nome', type: 'text' },
            { key: 'email', label: 'E-mail', type: 'email' },
            { key: 'password', label: 'Senha', type: 'password' },
            { key: 'city', label: 'Cidade', type: 'text' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                required
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
            <select
              value={form.level}
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as PlayerLevel }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
            <select
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as Gender | '' }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white rounded-lg py-2.5 font-medium hover:bg-brand-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link href="/login" className="text-brand font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
