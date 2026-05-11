'use client'

export const dynamic = 'force-dynamic'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, register } from '@/lib/api/auth'
import { useAuth } from '@/contexts/auth-context'
import { Gender, PlayerLevel, Sport } from '@rank-app/shared'
import { SPORT_OPTIONS } from '@/lib/sports'
import { User, Lock, Mail, MapPin, Trophy, Eye, EyeOff } from 'lucide-react'
import { forgotPassword } from '@/lib/api/auth'
import { AvatarUpload } from '@/components/ui/avatar-upload'

const inputRow = 'flex items-center gap-3 border border-gray-200 bg-gray-50 px-4 py-3.5 focus-within:border-brand focus-within:bg-white transition-all'
const inputField = 'flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none'

function Field({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className={inputRow}>
      <Icon size={15} className="text-gray-300 shrink-0" />
      {children}
    </div>
  )
}

type Tab = 'login' | 'register'

export default function AuthPage() {
  const router = useRouter()
  const { login: setAuth } = useAuth()
  const [tab, setTab] = useState<Tab>('login')

  const [loginForm, setLoginForm]       = useState({ email: '', password: '' })
  const [loginError, setLoginError]     = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showLoginPwd, setShowLoginPwd] = useState(false)

  // Forgot password
  const [forgotOpen, setForgotOpen]     = useState(false)
  const [forgotEmail, setForgotEmail]   = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent]     = useState(false)
  const [forgotError, setForgotError]   = useState('')

  const [showRegPwd, setShowRegPwd]     = useState(false)

  const [regForm, setRegForm] = useState({
    name: '', email: '', password: '', city: '',
    sport: '' as Sport | '',
    level: 'BEGINNER' as PlayerLevel,
    gender: '' as Gender | '',
  })
  const [regAvatar, setRegAvatar]   = useState('')
  const [regError, setRegError]     = useState('')
  const [regLoading, setRegLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const { accessToken, player } = await login(loginForm.email, loginForm.password)
      setAuth(player, accessToken)
      router.push('/dashboard')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setForgotError('')
    setForgotLoading(true)
    try {
      await forgotPassword(forgotEmail)
      setForgotSent(true)
    } catch {
      setForgotError('Erro ao enviar e-mail. Tente novamente.')
    } finally {
      setForgotLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!regForm.sport) { setRegError('Selecione um esporte'); return }
    setRegError('')
    setRegLoading(true)
    try {
      const { accessToken, player } = await register({
        name: regForm.name,
        email: regForm.email,
        password: regForm.password,
        city: regForm.city,
        sport: regForm.sport as Sport,
        level: regForm.level,
        gender: regForm.gender || undefined,
        avatar: regAvatar || undefined,
      })
      setAuth(player, accessToken)
      router.push('/dashboard')
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'Erro ao cadastrar')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Painel esquerdo — fundo navy do logo ── */}
      <div className="hidden lg:flex w-[480px] shrink-0 flex-col items-center justify-center bg-navy px-16 py-20 text-center relative overflow-hidden">
        {/* Detalhe decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/[0.02] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/[0.02] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo PNG versão fundo escuro */}
          <div className="mb-12 w-full flex justify-center">
            <Image
              src="/logo-dark.png"
              alt="RANK"
              width={320}
              height={173}
              style={{ objectFit: 'contain', width: '100%', maxWidth: 320, height: 'auto' }}
              priority
            />
          </div>

          <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto mb-12">
            O ranking esportivo da sua cidade. Registre partidas, suba no Rating e encontre adversários do seu nível.
          </p>

          <div className="grid grid-cols-3 gap-6">
            {[
              { n: '10k+', label: 'Atletas' },
              { n: '50k+', label: 'Partidas' },
              { n: '14',   label: 'Esportes' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-black text-accent">{s.n}</p>
                <p className="text-white/30 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Painel direito — Formulário ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-sm">

          {/* Logo — PNG real para fundo branco */}
          <div className="mb-10">
            <Link href="/">
              <Image
                src="/logo-light.png"
                alt="RANK"
                width={160}
                height={80}
                style={{ objectFit: 'contain', height: 'auto' }}
                priority
              />
            </Link>
          </div>

          {/* Abas */}
          <div className="flex border-b border-gray-200 mb-8">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 pb-3 text-sm font-bold tracking-wide transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? 'text-brand border-brand'
                    : 'text-gray-300 border-transparent hover:text-gray-500'
                }`}
              >
                {t === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          {/* Entrar */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <Field icon={Mail}>
                <input type="email" placeholder="E-mail" required value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  className={inputField} />
              </Field>

              <div className={`${inputRow} relative`}>
                <Lock size={15} className="text-gray-300 shrink-0" />
                <input
                  type={showLoginPwd ? 'text' : 'password'}
                  placeholder="Senha"
                  required
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  className={inputField}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPwd(v => !v)}
                  className="text-gray-300 hover:text-gray-500 transition-colors ml-1 shrink-0"
                  tabIndex={-1}
                  aria-label={showLoginPwd ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showLoginPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Esqueceu a senha */}
              <div className="text-right -mt-1">
                <button
                  type="button"
                  onClick={() => { setForgotOpen(true); setForgotSent(false); setForgotError(''); setForgotEmail('') }}
                  className="text-xs text-brand hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Painel inline de recuperação */}
              {forgotOpen && (
                <div className="border border-brand/20 bg-brand/5 px-4 py-4 rounded-sm">
                  {forgotSent ? (
                    <p className="text-sm text-brand font-medium text-center">
                      ✓ Se esse e-mail existir, você receberá um link de redefinição em breve.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 mb-3">
                        Informe seu e-mail e enviaremos um link para redefinir sua senha.
                      </p>
                      <form onSubmit={handleForgot} className="flex flex-col gap-2">
                        <div className={inputRow}>
                          <Mail size={15} className="text-gray-300 shrink-0" />
                          <input
                            type="email"
                            placeholder="Seu e-mail"
                            required
                            value={forgotEmail}
                            onChange={e => setForgotEmail(e.target.value)}
                            className={inputField}
                          />
                        </div>
                        {forgotError && (
                          <p className="text-red-500 text-xs">{forgotError}</p>
                        )}
                        <div className="flex gap-2 mt-1">
                          <button
                            type="submit"
                            disabled={forgotLoading}
                            className="flex-1 bg-brand text-white text-xs font-bold py-2.5 hover:bg-brand-dark disabled:opacity-50 transition-colors"
                          >
                            {forgotLoading ? 'Enviando...' : 'Enviar link'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setForgotOpen(false)}
                            className="text-xs text-gray-400 hover:text-gray-600 px-3 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              )}

              {loginError && (
                <p className="text-red-500 text-sm bg-red-50 px-4 py-3">{loginError}</p>
              )}

              <button type="submit" disabled={loginLoading}
                className="w-full bg-brand text-white font-bold text-sm py-4 hover:bg-brand-dark disabled:opacity-50 transition-colors mt-1">
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>

              <p className="text-center text-xs text-gray-400 mt-2">
                Não tem conta?{' '}
                <button type="button" onClick={() => setTab('register')}
                  className="text-brand font-semibold hover:underline">
                  Cadastre-se grátis
                </button>
              </p>
            </form>
          )}

          {/* Cadastrar */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3">

              {/* Foto de perfil */}
              <div className="flex justify-center py-1">
                <AvatarUpload
                  name="avatar"
                  value={regAvatar}
                  onChange={setRegAvatar}
                />
              </div>

              <Field icon={User}>
                <input type="text" placeholder="Nome completo" required value={regForm.name}
                  onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                  className={inputField} />
              </Field>

              <Field icon={Mail}>
                <input type="email" placeholder="E-mail" required value={regForm.email}
                  onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                  className={inputField} />
              </Field>

              <div className={inputRow}>
                <Lock size={15} className="text-gray-300 shrink-0" />
                <input
                  type={showRegPwd ? 'text' : 'password'}
                  placeholder="Senha (mín. 6 caracteres)"
                  required
                  minLength={6}
                  value={regForm.password}
                  onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                  className={inputField}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPwd(v => !v)}
                  className="text-gray-300 hover:text-gray-500 transition-colors ml-1 shrink-0"
                  tabIndex={-1}
                  aria-label={showRegPwd ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showRegPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <Field icon={MapPin}>
                <input type="text" placeholder="Cidade" required value={regForm.city}
                  onChange={e => setRegForm(f => ({ ...f, city: e.target.value }))}
                  className={inputField} />
              </Field>

              <Field icon={Trophy}>
                <select value={regForm.sport}
                  onChange={e => setRegForm(f => ({ ...f, sport: e.target.value as Sport }))}
                  className={`${inputField} cursor-pointer`} required>
                  <option value="">Selecione seu esporte</option>
                  {SPORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              {regError && (
                <p className="text-red-500 text-sm bg-red-50 px-4 py-3">{regError}</p>
              )}

              <button type="submit" disabled={regLoading}
                className="w-full bg-brand text-white font-bold text-sm py-4 hover:bg-brand-dark disabled:opacity-50 transition-colors mt-3">
                {regLoading ? 'Criando conta...' : 'Criar conta grátis'}
              </button>

              <p className="text-center text-xs text-gray-400 mt-2">
                Já tem conta?{' '}
                <button type="button" onClick={() => setTab('login')}
                  className="text-brand font-semibold hover:underline">
                  Entrar
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
