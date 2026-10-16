import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from './AuthContext'
import { getErrorMessage } from '../../lib/api'
import { Loader2, AlertCircle } from 'lucide-react'
import SpaceBackground from '../../components/SpaceBackground'

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  // fases: idle → ignition (dorado + vibra) → launch (sube) → done
  const [phase, setPhase] = useState<'idle' | 'ignition' | 'launch' | 'done'>('idle')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await login(data.email, data.password)
      // Fase 1: dorado + vibración
      setPhase('ignition')
      // Fase 2: despegue
      setTimeout(() => setPhase('launch'), 1000)
      // Fase 3: navegar cuando ya salió de pantalla
      setTimeout(() => { setPhase('done'); navigate('/') }, 2200)
    } catch (e) {
      setError(getErrorMessage(e))
      setPhase('idle')
    }
  }

  const launching = phase !== 'idle'

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#050b18' }}
    >
      <SpaceBackground />

      {/* Fondo que oscurece durante el despegue */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 5, pointerEvents: 'none',
        background: 'rgba(0,0,0,0)',
        transition: phase === 'launch' ? 'background 1s ease' : 'none',
        ...(phase === 'launch' || phase === 'done' ? { background: 'rgba(0,0,0,0.7)' } : {}),
      }} />

      {/* Texto de bienvenida que aparece cuando la card sube */}
      {(phase === 'launch' || phase === 'done') && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <p style={{
            fontSize: '0.8rem', letterSpacing: '0.35em',
            color: '#f59e0b', fontWeight: 600,
            textTransform: 'uppercase', marginBottom: '1rem',
            animation: 'welcomeFadeIn 0.5s ease 0.1s forwards', opacity: 0,
          }}>
            Campuslands · Sistema de gestión
          </p>

          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: 800, textAlign: 'center', lineHeight: 1.15,
            background: 'linear-gradient(135deg, #ffffff 30%, #fbbf24 65%, #f97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'welcomeSlideUp 0.7s cubic-bezier(0.2,0,0,1) 0.2s forwards',
            opacity: 0, transform: 'translateY(24px)',
          }}>
            Bienvenido a<br />CampusFlow 🚀
          </h1>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: '1.5rem',
            animation: 'welcomeFadeIn 0.5s ease 0.6s forwards', opacity: 0,
          }}>
            {[0, 0.15, 0.3].map((delay, i) => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: ['#fbbf24','#f97316','#ef4444'][i],
                animation: `dot 0.8s ease-in-out ${delay}s infinite`,
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Humo en la parte de abajo */}
      {(phase === 'ignition' || phase === 'launch') && (
        <div style={{
          position: 'fixed', bottom: '20%', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 8, pointerEvents: 'none',
        }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 14 + i * 16, height: 14 + i * 16,
              borderRadius: '50%',
              background: 'rgba(180,180,200,0.18)',
              left: -(14 + i * 16) / 2 + Math.sin(i * 2) * 20,
              top: i * 10,
              animation: `smokeUp 1s ease-out ${i * 0.07}s infinite`,
              filter: 'blur(4px)',
            }} />
          ))}
        </div>
      )}

      {/* LA CARD */}
      <div
        className="relative w-full max-w-md"
        style={{ zIndex: 10 }}
      >
        <div
          style={{
            padding: '2rem',
            borderRadius: '1rem',
            overflow: 'hidden',
            position: 'relative',

            /* Colores base → dorado en ignición */
            background: phase === 'idle' || phase === 'done'
              ? 'rgba(10,15,35,0.92)'
              : 'rgba(30,18,5,0.95)',

            border: phase === 'idle'
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(251,191,36,0.6)',

            boxShadow: phase === 'idle'
              ? '0 0 60px rgba(15,68,224,0.15)'
              : phase === 'ignition'
                ? '0 0 60px rgba(251,191,36,0.5), 0 0 120px rgba(251,146,60,0.3), 0 0 200px rgba(251,191,36,0.15)'
                : '0 0 80px rgba(251,191,36,0.7), 0 0 160px rgba(251,146,60,0.5)',

            backdropFilter: 'blur(20px)',

            /* Vibración en ignición, despegue en launch */
            animation: phase === 'ignition'
              ? 'cardShake 0.09s ease-in-out infinite'
              : 'none',

            transform: phase === 'launch' || phase === 'done'
              ? 'translateY(-140vh)'
              : 'translateY(0)',

            transition: phase === 'launch'
              ? 'transform 1s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease, border 0.3s ease, background 0.3s ease'
              : 'box-shadow 0.4s ease, border 0.4s ease, background 0.4s ease',
          }}
        >
          {/* Brillo dorado superior */}
          {phase !== 'idle' && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 2,
              background: 'linear-gradient(90deg, transparent, #fbbf24, #f97316, #fbbf24, transparent)',
              animation: 'shimmer 0.6s ease-in-out infinite',
            }} />
          )}

          {/* Llamas en la parte inferior */}
          {(phase === 'ignition' || phase === 'launch') && (
            <div style={{
              position: 'absolute', bottom: -8, left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', gap: 5, alignItems: 'flex-start',
            }}>
              {/* Llama central */}
              <div style={{
                width: 30,
                height: phase === 'launch' ? 100 : 48,
                borderRadius: '4px 4px 50% 50%',
                background: 'linear-gradient(180deg, #fff 0%, #fef08a 10%, #fbbf24 28%, #f97316 55%, #dc2626 80%, transparent 100%)',
                animation: 'flame 0.07s ease-in-out infinite alternate',
                filter: 'blur(1px)',
                transition: 'height 0.35s ease',
              }} />
              {/* Llamas laterales */}
              {[{ x: -18, w: 18, h: phase === 'launch' ? 70 : 30, spd: '0.09s' },
                { x: 18,  w: 18, h: phase === 'launch' ? 70 : 30, spd: '0.11s' }].map((f, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  left: `calc(50% + ${f.x}px)`, top: 0,
                  width: f.w, height: f.h,
                  borderRadius: '4px 4px 50% 50%',
                  background: 'linear-gradient(180deg, #fbbf24 0%, #f97316 45%, transparent 100%)',
                  animation: `flame ${f.spd} ease-in-out infinite alternate`,
                  opacity: 0.85, filter: 'blur(1px)',
                  transition: 'height 0.35s ease',
                }} />
              ))}
            </div>
          )}

          {/* Contenido del formulario */}
          <div style={{
            opacity: phase === 'launch' ? 0.4 : 1,
            transition: 'opacity 0.4s ease',
            filter: phase === 'ignition' ? 'brightness(1.1)' : 'none',
          }}>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <img src="/images/logo.png" alt="CampusFlow" className="h-12 w-auto object-contain" />
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">CampusFlow</h1>
                <p className="text-xs text-blue-400/70">Sistema de gestión del campus</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Bienvenido 👋</h2>
            <p className="text-slate-400 mb-6 text-sm">Ingresa con tu cuenta institucional</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Correo electrónico</label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@campusflow.co"
                  disabled={launching}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={launching}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-lg px-4 py-3 border border-red-500/20"
                  style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400 text-sm leading-snug">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || launching}
                className="w-full font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-white"
                style={{
                  background: phase === 'ignition' || phase === 'launch'
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'linear-gradient(135deg, #1d4ed8, #1e3a8a)',
                  boxShadow: phase === 'ignition' || phase === 'launch'
                    ? '0 4px 20px rgba(245,158,11,0.5)'
                    : '0 4px 20px rgba(29,78,216,0.4)',
                  transition: 'background 0.4s ease, box-shadow 0.4s ease',
                }}
              >
                {isSubmitting
                  ? <><Loader2 size={16} className="animate-spin" /> Verificando...</>
                  : phase === 'ignition'
                    ? '🔥 Iniciando despegue...'
                    : phase === 'launch'
                      ? '🚀 Despegando...'
                      : '🚀 Ingresar'}
              </button>
            </form>

            <div className="mt-6 p-3 rounded-lg border border-white/5"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs text-slate-500 font-medium mb-1.5">Cuentas de demostración:</p>
              <p className="text-xs text-slate-500 font-mono">admin@campusflow.co / Admin1234!</p>
              <p className="text-xs text-slate-500 font-mono">staff@campusflow.co / Staff1234!</p>
              <p className="text-xs text-slate-500 font-mono">ana@campusflow.co / Student1234!</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cardShake {
          0%   { transform: translate(-1.5px,  1px) rotate(-0.3deg); }
          25%  { transform: translate( 1.5px, -1px) rotate( 0.3deg); }
          50%  { transform: translate(-1px,  -1.5px) rotate(0deg); }
          75%  { transform: translate( 1px,   1.5px) rotate(-0.2deg); }
          100% { transform: translate(0, 0) rotate(0); }
        }
        @keyframes flame {
          0%   { transform: scaleX(0.85) scaleY(0.97); }
          100% { transform: scaleX(1.15) scaleY(1.06); }
        }
        @keyframes shimmer {
          0%   { opacity: 0.6; transform: scaleX(0.8); }
          50%  { opacity: 1;   transform: scaleX(1); }
          100% { opacity: 0.6; transform: scaleX(0.8); }
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
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%           { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
