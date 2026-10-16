import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from './AuthContext'
import { getErrorMessage, api } from '../../lib/api'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import SpaceBackground from '../../components/SpaceBackground'

// ── Schemas ──────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

const registerSchema = z.object({
  full_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})

type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>

// ── Componente principal ──────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [phase, setPhase] = useState<'idle' | 'ignition' | 'launch' | 'done'>('idle')

  const launching = phase !== 'idle'

  // ── Form login ──────────────────────────────────────────────────────────────
  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) })

  const switchMode = (next: 'login' | 'register') => {
    setMode(next)
    setError('')
    setSuccess('')
    loginForm.reset()
    registerForm.reset()
  }

  // ── Submit login ────────────────────────────────────────────────────────────
  const onLogin = async (data: LoginData) => {
    setError('')
    try {
      await login(data.email, data.password)
      setPhase('ignition')
      setTimeout(() => setPhase('launch'), 1000)
      setTimeout(() => { setPhase('done'); navigate('/') }, 2200)
    } catch (e) {
      setError(getErrorMessage(e))
      setPhase('idle')
    }
  }

  // ── Submit registro ─────────────────────────────────────────────────────────
  const onRegister = async (data: RegisterData) => {
    setError('')
    setSuccess('')
    try {
      await api.post('/auth/register', {
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      })
      setSuccess('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.')
      registerForm.reset()
      setTimeout(() => switchMode('login'), 2000)
    } catch (e) {
      setError(getErrorMessage(e))
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#050b18' }}
    >
      <SpaceBackground />

      {/* Oscurecimiento durante despegue */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 5, pointerEvents: 'none',
        background: phase === 'launch' || phase === 'done' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0)',
        transition: 'background 1s ease',
      }} />

      {/* Texto de bienvenida cuando la card sube */}
      {(phase === 'launch' || phase === 'done') && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <p style={{
            fontSize: '0.8rem', letterSpacing: '0.35em', color: '#f59e0b',
            fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem',
            animation: 'welcomeFadeIn 0.5s ease 0.1s forwards', opacity: 0,
          }}>
            Campuslands · Sistema de gestión
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 800,
            textAlign: 'center', lineHeight: 1.15,
            background: 'linear-gradient(135deg, #ffffff 30%, #fbbf24 65%, #f97316 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            animation: 'welcomeSlideUp 0.7s cubic-bezier(0.2,0,0,1) 0.2s forwards',
            opacity: 0, transform: 'translateY(24px)',
          }}>
            Bienvenido a<br />CampusFlow 🚀
          </h1>
          <div style={{
            display: 'flex', gap: 8, marginTop: '1.5rem',
            animation: 'welcomeFadeIn 0.5s ease 0.6s forwards', opacity: 0,
          }}>
            {[['#fbbf24', 0], ['#f97316', 0.15], ['#ef4444', 0.3]].map(([color, delay], i) => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%', background: color as string,
                animation: `dot 0.8s ease-in-out ${delay}s infinite`,
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Humo */}
      {(phase === 'ignition' || phase === 'launch') && (
        <div style={{
          position: 'fixed', bottom: '20%', left: '50%',
          transform: 'translateX(-50%)', zIndex: 8, pointerEvents: 'none',
        }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 14 + i * 16, height: 14 + i * 16, borderRadius: '50%',
              background: 'rgba(180,180,200,0.18)',
              left: -(14 + i * 16) / 2 + Math.sin(i * 2) * 20, top: i * 10,
              animation: `smokeUp 1s ease-out ${i * 0.07}s infinite`,
              filter: 'blur(4px)',
            }} />
          ))}
        </div>
      )}

      {/* ── CARD ── */}
      <div className="relative w-full max-w-md" style={{ zIndex: 10 }}>
        <div style={{
          padding: '2rem', borderRadius: '1rem', overflow: 'hidden', position: 'relative',
          background: phase === 'idle' ? 'rgba(10,15,35,0.92)' : 'rgba(30,18,5,0.95)',
          border: phase === 'idle' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(251,191,36,0.6)',
          boxShadow: phase === 'idle'
            ? '0 0 60px rgba(15,68,224,0.15)'
            : phase === 'ignition'
              ? '0 0 60px rgba(251,191,36,0.5), 0 0 120px rgba(251,146,60,0.3)'
              : '0 0 80px rgba(251,191,36,0.7), 0 0 160px rgba(251,146,60,0.5)',
          backdropFilter: 'blur(20px)',
          animation: phase === 'ignition' ? 'cardShake 0.09s ease-in-out infinite' : 'none',
          transform: phase === 'launch' || phase === 'done' ? 'translateY(-140vh)' : 'translateY(0)',
          transition: phase === 'launch'
            ? 'transform 1s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease'
            : 'box-shadow 0.4s ease, border 0.4s ease, background 0.4s ease',
        }}>

          {/* Brillo dorado */}
          {phase !== 'idle' && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, #fbbf24, #f97316, #fbbf24, transparent)',
              animation: 'shimmer 0.6s ease-in-out infinite',
            }} />
          )}

          {/* Llamas */}
          {(phase === 'ignition' || phase === 'launch') && (
            <div style={{
              position: 'absolute', bottom: -8, left: '50%',
              transform: 'translateX(-50%)', display: 'flex', gap: 5,
            }}>
              <div style={{
                width: 30, height: phase === 'launch' ? 100 : 48,
                borderRadius: '4px 4px 50% 50%',
                background: 'linear-gradient(180deg,#fff 0%,#fef08a 10%,#fbbf24 28%,#f97316 55%,#dc2626 80%,transparent 100%)',
                animation: 'flame 0.07s ease-in-out infinite alternate',
                filter: 'blur(1px)', transition: 'height 0.35s ease',
              }} />
              {[[-18, '0.09s'], [18, '0.11s']].map(([x, spd], i) => (
                <div key={i} style={{
                  position: 'absolute', left: `calc(50% + ${x}px)`, top: 0,
                  width: 18, height: phase === 'launch' ? 70 : 30,
                  borderRadius: '4px 4px 50% 50%',
                  background: 'linear-gradient(180deg,#fbbf24 0%,#f97316 45%,transparent 100%)',
                  animation: `flame ${spd} ease-in-out infinite alternate`,
                  opacity: 0.85, filter: 'blur(1px)', transition: 'height 0.35s ease',
                }} />
              ))}
            </div>
          )}

          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <img src="/images/logo.png" alt="CampusFlow" className="h-11 w-auto object-contain" />
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">CampusFlow</h1>
              <p className="text-xs text-blue-400/70">Sistema de gestión del campus</p>
            </div>
          </div>

          {/* Toggle login / registro */}
          <div className="flex rounded-lg p-1 mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                disabled={launching}
                className="flex-1 py-2 text-sm font-medium rounded-md transition-all"
                style={{
                  background: mode === m ? 'rgba(29,78,216,0.8)' : 'transparent',
                  color: mode === m ? 'white' : 'rgba(148,163,184,1)',
                  boxShadow: mode === m ? '0 2px 8px rgba(29,78,216,0.4)' : 'none',
                }}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* ── FORM LOGIN ── */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Correo electrónico</label>
                <input {...loginForm.register('email')} type="email" autoComplete="email"
                  placeholder="usuario@campusflow.co" disabled={launching}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                {loginForm.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
                <input {...loginForm.register('password')} type="password" autoComplete="current-password"
                  placeholder="••••••••" disabled={launching}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                {loginForm.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-lg px-4 py-3 border border-red-500/20"
                  style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400 text-sm leading-snug">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loginForm.formState.isSubmitting || launching}
                className="w-full font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-white"
                style={{
                  background: phase !== 'idle'
                    ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                    : 'linear-gradient(135deg,#1d4ed8,#1e3a8a)',
                  boxShadow: phase !== 'idle'
                    ? '0 4px 20px rgba(245,158,11,0.5)'
                    : '0 4px 20px rgba(29,78,216,0.4)',
                  transition: 'background 0.4s, box-shadow 0.4s',
                }}>
                {loginForm.formState.isSubmitting
                  ? <><Loader2 size={16} className="animate-spin" />Verificando...</>
                  : phase === 'ignition' ? '🔥 Iniciando despegue...'
                  : phase === 'launch' ? '🚀 Despegando...'
                  : '🚀 Ingresar'}
              </button>

              <div className="p-3 rounded-lg border border-white/5 mt-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs text-slate-500 font-medium mb-1">Cuentas de demostración:</p>
                <p className="text-xs text-slate-500 font-mono">admin@campusflow.co / Admin1234!</p>
                <p className="text-xs text-slate-500 font-mono">staff@campusflow.co / Staff1234!</p>
                <p className="text-xs text-slate-500 font-mono">ana@campusflow.co / Student1234!</p>
              </div>
            </form>
          )}

          {/* ── FORM REGISTRO ── */}
          {mode === 'register' && (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nombre completo</label>
                <input {...registerForm.register('full_name')} type="text" autoComplete="name"
                  placeholder="Tu nombre completo"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                {registerForm.formState.errors.full_name && (
                  <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Correo electrónico</label>
                <input {...registerForm.register('email')} type="email" autoComplete="email"
                  placeholder="usuario@campusflow.co"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                {registerForm.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
                <input {...registerForm.register('password')} type="password" autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                {registerForm.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Confirmar contraseña</label>
                <input {...registerForm.register('confirm_password')} type="password" autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                {registerForm.formState.errors.confirm_password && (
                  <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.confirm_password.message}</p>
                )}
              </div>

              {/* Nota de rol */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-500/20"
                style={{ background: 'rgba(29,78,216,0.08)' }}>
                <span className="text-blue-400 text-xs">ℹ️</span>
                <p className="text-xs text-slate-400">
                  Las cuentas nuevas se crean con rol de <span className="text-blue-300 font-medium">Estudiante</span>. Un administrador puede cambiar el rol después.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-lg px-4 py-3 border border-red-500/20"
                  style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400 text-sm leading-snug">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2.5 rounded-lg px-4 py-3 border border-emerald-500/20"
                  style={{ background: 'rgba(16,185,129,0.08)' }}>
                  <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-emerald-400 text-sm leading-snug">{success}</p>
                </div>
              )}

              <button type="submit" disabled={registerForm.formState.isSubmitting}
                className="w-full font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-white"
                style={{
                  background: 'linear-gradient(135deg,#1d4ed8,#1e3a8a)',
                  boxShadow: '0 4px 20px rgba(29,78,216,0.4)',
                }}>
                {registerForm.formState.isSubmitting
                  ? <><Loader2 size={16} className="animate-spin" />Creando cuenta...</>
                  : '✨ Crear cuenta'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes cardShake {
          0%   { transform: translate(-1.5px, 1px) rotate(-0.3deg); }
          25%  { transform: translate(1.5px, -1px) rotate(0.3deg); }
          50%  { transform: translate(-1px, -1.5px) rotate(0deg); }
          75%  { transform: translate(1px, 1.5px) rotate(-0.2deg); }
          100% { transform: translate(0,0) rotate(0); }
        }
        @keyframes flame {
          0%   { transform: scaleX(0.85) scaleY(0.97); }
          100% { transform: scaleX(1.15) scaleY(1.06); }
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.6; transform: scaleX(0.8); }
          50%     { opacity: 1;   transform: scaleX(1); }
        }
        @keyframes smokeUp {
          0%   { opacity: 0.4; transform: scale(1) translateY(0); }
          100% { opacity: 0;   transform: scale(2.5) translateY(-60px); }
        }
        @keyframes welcomeFadeIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes welcomeSlideUp {
          0%   { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes dot {
          0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
          40%         { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
