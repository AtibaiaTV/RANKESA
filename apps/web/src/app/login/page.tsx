'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, register, forgotPassword } from '@/lib/api/auth'
import { useAuth } from '@/contexts/auth-context'
import { Gender, PlayerLevel, Sport } from '@rank-app/shared'
import { SPORT_OPTIONS } from '@/lib/sports'
import Image from 'next/image'
import { User, Lock, Mail, MapPin, Trophy, Eye, EyeOff, Smartphone } from 'lucide-react'
import { AvatarUpload } from '@/components/ui/avatar-upload'

type Tab = 'login' | 'register'

const TEAL = '#00BFA5'

const PHOTOS = [
  { src: '/sports/athlete-1.jpg', pos: 'center 15%' },
  { src: '/sports/athlete-2.jpg', pos: 'center 30%' },
  { src: '/sports/athlete-3.jpg', pos: 'center center' },
  { src: '/sports/athlete-4.jpg', pos: 'center 20%' },
]


function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', color: '#8B99AA', fontSize: 13, fontWeight: 500, marginBottom: 7 }}>
      {children}
    </label>
  )
}

function Field({
  icon: Icon, label, type = 'text', placeholder, value, onChange, required, minLength, right,
}: {
  icon: React.ElementType; label?: string; type?: string; placeholder: string
  value: string; onChange: (v: string) => void; required?: boolean; minLength?: number; right?: React.ReactNode
}) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div style={{ position: 'relative' }}>
        <Icon size={15} style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: '#4A5A6A', pointerEvents: 'none', zIndex: 10,
        }} />
        <input
          type={type} placeholder={placeholder} value={value}
          required={required} minLength={minLength}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', background: '#16202E', border: '1px solid #1E2D40',
            borderRadius: 12, paddingLeft: 44, paddingRight: right ? 44 : 16,
            paddingTop: 14, paddingBottom: 14, fontSize: 14, color: '#E6EDF3',
            outline: 'none', transition: 'border-color .15s, box-shadow .15s',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = TEAL
            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(0,191,165,0.12)`
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = '#1E2D40'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        {right && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
            {right}
          </div>
        )}
      </div>
    </div>
  )
}

function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button type="button" tabIndex={-1} onClick={toggle}
      style={{ color: '#4A5A6A', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
      onMouseEnter={e => (e.currentTarget.style.color = '#E6EDF3')}
      onMouseLeave={e => (e.currentTarget.style.color = '#4A5A6A')}
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  )
}

export default function AuthPage() {
  const router = useRouter()
  const { login: setAuth } = useAuth()
  const [tab, setTab] = useState<Tab>('login')
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % PHOTOS.length), 4500)
    return () => clearInterval(t)
  }, [])

  const [lf, setLf]         = useState({ email: '', password: '' })
  const [lErr, setLErr]     = useState('')
  const [lLoad, setLLoad]   = useState(false)
  const [showLP, setShowLP] = useState(false)

  const [fo, setFo]         = useState(false)
  const [fe, setFe]         = useState('')
  const [fLoad, setFLoad]   = useState(false)
  const [fSent, setFSent]   = useState(false)
  const [fErr, setFErr]     = useState('')

  const [showRP, setShowRP] = useState(false)
  const [rf, setRf] = useState({
    name: '', email: '', password: '', city: '', phone: '',
    sport: '' as Sport | '', level: 'BEGINNER' as PlayerLevel, gender: '' as Gender | '',
  })
  const [rAvt, setRAvt]   = useState('')
  const [rErr, setRErr]   = useState('')
  const [rLoad, setRLoad] = useState(false)

  async function onLogin(e: React.FormEvent) {
    e.preventDefault(); setLErr(''); setLLoad(true)
    try {
      const { accessToken, player } = await login(lf.email, lf.password)
      setAuth(player, accessToken); router.push('/dashboard')
    } catch (err) { setLErr(err instanceof Error ? err.message : 'Erro ao fazer login') }
    finally { setLLoad(false) }
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault(); setFErr(''); setFLoad(true)
    try { await forgotPassword(fe); setFSent(true) }
    catch { setFErr('Erro ao enviar e-mail. Tente novamente.') }
    finally { setFLoad(false) }
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!rf.sport) { setRErr('Selecione um esporte'); return }
    setRErr(''); setRLoad(true)
    try {
      const { accessToken, player } = await register({
        ...rf, sport: rf.sport as Sport,
        gender: rf.gender || undefined, avatar: rAvt || undefined,
        phone: rf.phone.trim(),
      })
      setAuth(player, accessToken); router.push('/dashboard')
    } catch (err) { setRErr(err instanceof Error ? err.message : 'Erro ao cadastrar') }
    finally { setRLoad(false) }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0B1520' }}>

      {/* ══ LEFT — athlete collage ══ */}
      <div
        className="hidden lg:block"
        style={{ width: '48%', height: '100vh', position: 'relative', overflow: 'hidden' }}
      >
        {/* Carousel — crossfade between photos */}
        {PHOTOS.map(({ src, pos }, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url('${src}')`,
            backgroundSize: 'cover',
            backgroundPosition: pos,
            filter: 'brightness(0.62) saturate(0.8)',
            opacity: i === slide ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
          }} />
        ))}

        {/* Overall vignette */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 20%, transparent 75%, rgba(0,0,0,0.25) 100%)',
        }} />

        {/* Dot indicators */}
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6, pointerEvents: 'none',
        }}>
          {PHOTOS.map((_, i) => (
            <div key={i} style={{
              width: i === slide ? 20 : 6, height: 6, borderRadius: 3,
              background: i === slide ? TEAL : 'rgba(255,255,255,0.3)',
              transition: 'all .4s',
            }} />
          ))}
        </div>

        {/* Right-edge fade into form panel */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 90,
          background: 'linear-gradient(to right, transparent, #0B1520)',
          pointerEvents: 'none',
        }} />

      </div>

      {/* ══ RIGHT — form panel ══ */}
      <div style={{
        flex: 1, height: '100vh', overflowY: 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', background: '#0B1520',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Brand */}
          <div style={{ marginBottom: 32 }}>
            <Image src="/rankesa-dark.svg" alt="RANKESA" width={200} height={54} style={{ height: 54, width: 'auto', marginBottom: 8 }} priority />
            <p style={{ color: TEAL, fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', margin: 0 }}>
              JOGUE. CONECTE. EVOLUA.
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {(['login', 'register'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 10,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  border: tab === t ? 'none' : '1px solid #1E2D40',
                  background: tab === t ? TEAL : 'transparent',
                  color: tab === t ? '#0B1520' : '#4A5A6A',
                  transition: 'all .18s',
                }}
              >
                {t === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          {/* ── LOGIN ── */}
          {tab === 'login' && (
            <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field icon={Mail} label="Email" type="email" placeholder="seu@email.com"
                value={lf.email} onChange={v => setLf(f => ({ ...f, email: v }))} required />

              <Field icon={Lock} label="Senha" type={showLP ? 'text' : 'password'} placeholder="••••••••••"
                value={lf.password} onChange={v => setLf(f => ({ ...f, password: v }))} required
                right={<EyeBtn show={showLP} toggle={() => setShowLP(v => !v)} />} />

              <div style={{ textAlign: 'right', marginTop: -6 }}>
                <button type="button"
                  onClick={() => { setFo(v => !v); setFSent(false); setFErr(''); setFe('') }}
                  style={{ color: TEAL, fontSize: 12, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Esqueceu a senha?
                </button>
              </div>

              {fo && !fSent && (
                <div style={{ borderRadius: 12, padding: 16, background: '#16202E', border: `1px solid rgba(0,191,165,0.25)` }}>
                  <p style={{ color: '#6B7A8D', fontSize: 12, margin: '0 0 10px' }}>
                    Informe seu e-mail para receber o link de redefinição.
                  </p>
                  <form onSubmit={onForgot} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Field icon={Mail} type="email" placeholder="seu@email.com" value={fe} onChange={setFe} required />
                    {fErr && <p style={{ color: '#F87171', fontSize: 12, margin: 0 }}>{fErr}</p>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                      <button type="submit" disabled={fLoad}
                        style={{ flex: 1, background: TEAL, color: '#0B1520', fontSize: 13, fontWeight: 700, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer', opacity: fLoad ? .5 : 1 }}>
                        {fLoad ? 'Enviando...' : 'Enviar link'}
                      </button>
                      <button type="button" onClick={() => setFo(false)}
                        style={{ color: '#4A5A6A', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px' }}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {fo && fSent && (
                <p style={{ color: TEAL, fontSize: 13, background: 'rgba(0,191,165,0.07)', border: '1px solid rgba(0,191,165,0.2)', borderRadius: 12, padding: '10px 16px', margin: 0, textAlign: 'center' }}>
                  ✓ Se esse e-mail existir, você receberá um link em breve.
                </p>
              )}

              {lErr && (
                <p style={{ color: '#F87171', fontSize: 13, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 12, padding: '10px 16px', margin: 0 }}>
                  {lErr}
                </p>
              )}

              <button type="submit" disabled={lLoad}
                style={{ width: '100%', background: TEAL, color: '#0B1520', fontWeight: 700, fontSize: 15, padding: '15px 0', borderRadius: 12, border: 'none', cursor: 'pointer', opacity: lLoad ? .6 : 1, marginTop: 2 }}>
                {lLoad ? 'Entrando...' : 'Entrar'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: '#1C2A3A' }} />
                <span style={{ color: '#3A4A5A', fontSize: 12 }}>ou continue com</span>
                <div style={{ flex: 1, height: 1, background: '#1C2A3A' }} />
              </div>

              {([
                { label: 'Continuar com Google', icon: <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
                { label: 'Continuar com Apple', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> },
              ] as { label: string; icon: React.ReactNode }[]).map(({ label, icon }) => (
                <button key={label} type="button"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '13px 0', borderRadius: 12, background: 'transparent', border: '1px solid #1E2D40', color: '#C9D5E0', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'border-color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#2A3D55')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E2D40')}
                >
                  {icon} {label}
                </button>
              ))}

              <p style={{ textAlign: 'center', fontSize: 13, color: '#3A4A5A', margin: '4px 0 0' }}>
                Não tem conta?{' '}
                <button type="button" onClick={() => setTab('register')}
                  style={{ color: TEAL, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Cadastre-se
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER ── */}
          {tab === 'register' && (
            <form onSubmit={onRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0 6px' }}>
                <AvatarUpload name="avatar" value={rAvt} onChange={setRAvt} />
              </div>

              <Field icon={User} label="Nome completo" placeholder="Seu nome" value={rf.name}
                onChange={v => setRf(f => ({ ...f, name: v }))} required />
              <Field icon={Mail} label="Email" type="email" placeholder="seu@email.com" value={rf.email}
                onChange={v => setRf(f => ({ ...f, email: v }))} required />
              <Field icon={Lock} label="Senha" type={showRP ? 'text' : 'password'} placeholder="Mínimo 6 caracteres"
                value={rf.password} onChange={v => setRf(f => ({ ...f, password: v }))} required minLength={6}
                right={<EyeBtn show={showRP} toggle={() => setShowRP(v => !v)} />} />
              <Field icon={MapPin} label="Cidade" placeholder="Sua cidade" value={rf.city}
                onChange={v => setRf(f => ({ ...f, city: v }))} required />
              <Field icon={Smartphone} label="WhatsApp *" type="tel" placeholder="+55 11 99999-9999" value={rf.phone}
                onChange={v => setRf(f => ({ ...f, phone: v }))} required />

              <div>
                <FieldLabel>Esporte principal</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <Trophy size={15} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#4A5A6A', pointerEvents: 'none', zIndex: 10 }} />
                  <select value={rf.sport}
                    onChange={e => setRf(f => ({ ...f, sport: e.target.value as Sport }))}
                    required
                    style={{ width: '100%', background: '#16202E', border: '1px solid #1E2D40', borderRadius: 12, paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14, fontSize: 14, color: rf.sport ? '#E6EDF3' : '#4A5A6A', appearance: 'none', cursor: 'pointer', outline: 'none' }}
                    onFocus={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(0,191,165,0.12)` }}
                    onBlur={e  => { e.currentTarget.style.borderColor = '#1E2D40'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <option value="" disabled style={{ background: '#16202E' }}>Selecione seu esporte</option>
                    {SPORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} style={{ background: '#16202E', color: '#E6EDF3' }}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {rErr && (
                <p style={{ color: '#F87171', fontSize: 13, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 12, padding: '10px 16px', margin: 0 }}>
                  {rErr}
                </p>
              )}

              <button type="submit" disabled={rLoad}
                style={{ width: '100%', background: TEAL, color: '#0B1520', fontWeight: 700, fontSize: 15, padding: '15px 0', borderRadius: 12, border: 'none', cursor: 'pointer', opacity: rLoad ? .6 : 1, marginTop: 2 }}>
                {rLoad ? 'Criando conta...' : 'Criar conta grátis'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#3A4A5A', margin: '4px 0 0' }}>
                Já tem conta?{' '}
                <button type="button" onClick={() => setTab('login')}
                  style={{ color: TEAL, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
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
