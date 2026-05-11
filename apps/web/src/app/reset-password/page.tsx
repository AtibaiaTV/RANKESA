'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { resetPassword } from '@/lib/api/auth'

const inputRow = 'flex items-center gap-3 border border-gray-200 bg-gray-50 px-4 py-3.5 focus-within:border-brand focus-within:bg-white transition-all'
const inputField = 'flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    setError('')
    setLoading(true)
    try {
      await resetPassword(token, newPassword)
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token inválido ou expirado. Solicite um novo link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">

        <div className="mb-10">
          <Link href="/">
            <Image
              src="/logo-light.png"
              alt="RANK"
              width={140}
              height={70}
              style={{ objectFit: 'contain', height: 'auto' }}
              priority
            />
          </Link>
        </div>

        {!token ? (
          <div className="text-center">
            <p className="text-red-500 text-sm mb-4">Link inválido ou expirado.</p>
            <Link href="/login" className="text-brand text-sm font-semibold hover:underline">
              Voltar ao login
            </Link>
          </div>
        ) : done ? (
          <div className="text-center space-y-4">
            <CheckCircle2 size={40} className="text-accent mx-auto" />
            <h2 className="text-xl font-black text-gray-900">Senha redefinida!</h2>
            <p className="text-sm text-gray-500">Redirecionando para o login...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Nova senha</h1>
            <p className="text-sm text-gray-400 mb-8">Escolha uma senha segura com pelo menos 6 caracteres.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Nova senha */}
              <div className={inputRow}>
                <Lock size={15} className="text-gray-300 shrink-0" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Nova senha"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className={inputField}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="text-gray-300 hover:text-gray-500 transition-colors ml-1 shrink-0"
                  tabIndex={-1}
                  aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Confirmar senha */}
              <div className={inputRow}>
                <Lock size={15} className="text-gray-300 shrink-0" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirmar senha"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={inputField}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="text-gray-300 hover:text-gray-500 transition-colors ml-1 shrink-0"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Indicador de força */}
              {newPassword.length > 0 && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        newPassword.length >= i * 3
                          ? newPassword.length >= 10
                            ? 'bg-accent'
                            : newPassword.length >= 7
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              )}

              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand text-white font-bold text-sm py-4 hover:bg-brand-dark disabled:opacity-50 transition-colors mt-2"
              >
                {loading ? 'Salvando...' : 'Redefinir senha'}
              </button>

              <p className="text-center text-xs text-gray-400 mt-1">
                <Link href="/login" className="text-brand font-semibold hover:underline">
                  Voltar ao login
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
