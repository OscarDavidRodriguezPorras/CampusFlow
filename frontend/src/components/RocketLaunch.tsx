import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  onComplete: () => void
}

type Phase = 'ignition' | 'launch' | 'warp' | 'done'

function RocketOverlay({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('ignition')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('launch'), 900)
    const t2 = setTimeout(() => setPhase('warp'), 2200)
    const t3 = setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  if (phase === 'done') return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#050b18', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>

      {/* Estrellas de fondo */}
      {Array.from({ length: 80 }).map((_, i) => {
        const seed = (i * 2654435761) >>> 0
        const x = (seed % 1000) / 10
        const y = ((seed >> 10) % 1000) / 10
        const size = ((seed >> 20) % 2) + 1
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${x}%`, top: `${y}%`,
            width: size, height: size,
            borderRadius: '50%', background: 'white',
            opacity: phase === 'launch' ? 0.8 : 0.4,
            transition: 'opacity 0.3s',
            animation: phase === 'warp' ? 'starStretch 0.8s ease-out forwards' : 'none',
            transformOrigin: `${50 - x}% ${50 - y}%`,
          }} />
        )
      })}

      {/* Humo */}
      {(phase === 'ignition' || phase === 'launch') && (
        <div style={{
          position: 'absolute', bottom: '18%', left: '50%',
          transform: 'translateX(-50%)', pointerEvents: 'none',
        }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 16 + i * 20, height: 16 + i * 20,
              borderRadius: '50%',
              background: `rgba(180,190,210,0.2)`,
              left: -(16 + i * 20) / 2 + Math.sin(i * 1.8) * 25,
              top: i * 14,
              animation: `smokeRise 1s ease-out ${i * 0.07}s infinite`,
              filter: 'blur(5px)',
            }} />
          ))}
        </div>
      )}

      {/* Cohete SVG — despega desde el centro */}
      <div style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transform: phase === 'launch' || phase === 'warp'
          ? 'translateY(-150vh)'
          : phase === 'ignition'
            ? 'translateY(0)'
            : 'none',
        transition: phase === 'launch'
          ? 'transform 1.3s cubic-bezier(0.3, 0, 0.1, 1)'
          : 'none',
        animation: phase === 'ignition' ? 'rocketShake 0.09s ease-in-out infinite' : 'none',
      }}>
        {/* SVG cohete */}
        <svg width="90" height="180" viewBox="0 0 90 180" fill="none">
          {/* Cuerpo */}
          <path d="M45 8 C22 8 12 50 12 95 L12 140 L78 140 L78 95 C78 50 68 8 45 8Z"
            fill="url(#body)" />
          {/* Punta */}
          <path d="M45 8 C38 8 30 20 30 32 L60 32 C60 20 52 8 45 8Z"
            fill="#e2e8f0" />
          {/* Ventana */}
          <circle cx="45" cy="72" r="14" fill="url(#window)" />
          <circle cx="45" cy="72" r="10" fill="rgba(5,11,24,0.7)" />
          <circle cx="41" cy="68" r="4" fill="rgba(255,255,255,0.35)" />
          {/* Aletas */}
          <path d="M12 115 L0 148 L12 138Z" fill="url(#fin)" />
          <path d="M78 115 L90 148 L78 138Z" fill="url(#fin)" />
          {/* Detalles */}
          <rect x="16" y="88" width="5" height="32" rx="2.5" fill="rgba(255,255,255,0.15)" />
          <rect x="69" y="88" width="5" height="32" rx="2.5" fill="rgba(255,255,255,0.15)" />
          {/* Logo campus en la ventana */}
          <text x="45" y="76" textAnchor="middle" fontSize="10" fill="white" opacity="0.6"
            fontWeight="bold">CF</text>

          <defs>
            <linearGradient id="body" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a6e" />
              <stop offset="40%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a6e" />
            </linearGradient>
            <radialGradient id="window" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </radialGradient>
            <linearGradient id="fin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
        </svg>

        {/* Llamas */}
        <div style={{
          position: 'absolute', bottom: -10,
          left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'flex-start', gap: 4,
        }}>
          {/* Llama central grande */}
          <div style={{
            width: 32,
            height: phase === 'launch' ? 130 : 60,
            borderRadius: '4px 4px 60% 60%',
            background: 'linear-gradient(180deg, #fff 0%, #fef08a 10%, #fbbf24 25%, #f97316 50%, #dc2626 75%, transparent 100%)',
            animation: 'flamePulse 0.07s ease-in-out infinite alternate',
            transition: 'height 0.35s ease',
            filter: 'blur(1.5px)',
            marginTop: -4,
          }} />
          {/* Llamas laterales */}
          {[[-18, 0.09, 75], [18, 0.11, 75]].map(([offset, speed, h], idx) => (
            <div key={idx} style={{
              position: 'absolute',
              left: `calc(50% + ${offset}px)`,
              top: 0,
              width: 20,
              height: phase === 'launch' ? 90 : Number(h) - 30,
              borderRadius: '4px 4px 60% 60%',
              background: 'linear-gradient(180deg, #fef08a 0%, #f97316 40%, #ef4444 70%, transparent 100%)',
              animation: `flamePulse ${speed}s ease-in-out infinite alternate`,
              opacity: 0.9,
              transition: 'height 0.35s ease',
              filter: 'blur(1px)',
              marginTop: -2,
            }} />
          ))}
          {/* Chispas */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`spark-${i}`} style={{
              position: 'absolute',
              width: 3, height: 3,
              borderRadius: '50%',
              background: i % 2 === 0 ? '#fbbf24' : '#f97316',
              left: `calc(50% + ${(Math.random() - 0.5) * 40}px)`,
              top: 20 + Math.random() * 40,
              animation: `spark ${0.3 + Math.random() * 0.4}s ease-out ${Math.random() * 0.3}s infinite`,
            }} />
          ))}
        </div>
      </div>

      {/* Texto de estado */}
      <div style={{
        position: 'absolute', bottom: '8%',
        textAlign: 'center', width: '100%',
        opacity: phase === 'warp' ? 0 : 1,
        transition: 'opacity 0.3s',
      }}>
        <p style={{
          color: '#60a5fa', fontSize: '0.9rem',
          fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase',
          animation: 'textPulse 0.8s ease-in-out infinite',
        }}>
          {phase === 'ignition' ? '🔥 Iniciando secuencia de lanzamiento' : '🚀 Despegando hacia el campus'}
        </p>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10,
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#3b82f6',
              animation: `dot 1s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>

      {/* Flash de warp */}
      {phase === 'warp' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(100,160,255,0.6) 30%, transparent 70%)',
          animation: 'warpFlash 0.8s ease-out forwards',
        }} />
      )}

      <style>{`
        @keyframes rocketShake {
          0%   { transform: translate(-1.5px, 1px) rotate(-0.4deg); }
          33%  { transform: translate(1.5px, -1px) rotate(0.4deg); }
          66%  { transform: translate(-1px, -1.5px) rotate(0.1deg); }
          100% { transform: translate(1px, 1px) rotate(-0.2deg); }
        }
        @keyframes flamePulse {
          0%   { transform: scaleX(0.85) scaleY(0.97); }
          100% { transform: scaleX(1.15) scaleY(1.06); }
        }
        @keyframes smokeRise {
          0%   { opacity: 0.4; transform: scale(1) translateY(0); }
          100% { opacity: 0;   transform: scale(2.2) translateY(-50px); }
        }
        @keyframes spark {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(30px) scale(0.2); }
        }
        @keyframes starStretch {
          0%   { transform: scale(1); opacity: 0.8; }
          50%  { transform: scaleX(0.1) scaleY(8); opacity: 1; }
          100% { transform: scaleX(0) scaleY(20); opacity: 0; }
        }
        @keyframes warpFlash {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes textPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%           { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function RocketLaunch({ onComplete }: Props) {
  return createPortal(<RocketOverlay onComplete={onComplete} />, document.body)
}
