export default function SpaceBackground() {
  // Generar 120 estrellas con posiciones y tiempos aleatorios pero deterministas
  const stars = Array.from({ length: 120 }, (_, i) => {
    const seed = (i * 2654435761) >>> 0
    const x = (seed % 1000) / 10
    const y = ((seed >> 10) % 1000) / 10
    const size = ((seed >> 20) % 3) + 1
    const dur = 2 + ((seed >> 4) % 4)
    const delay = ((seed >> 8) % 50) / 10
    const op = 0.4 + ((seed >> 12) % 5) / 10
    return { x, y, size, dur, delay, op }
  })

  return (
    <>
      {/* Capa de estrellas */}
      <div className="stars-layer" aria-hidden="true">
        {stars.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              '--dur': `${s.dur}s`,
              '--delay': `${s.delay}s`,
              '--max-op': s.op,
            } as React.CSSProperties}
          />
        ))}

        {/* Nebulosas difusas */}
        <div style={{
          position: 'absolute', borderRadius: '50%',
          width: 600, height: 600, top: '-10%', right: '-5%',
          background: 'radial-gradient(circle, rgba(15,68,224,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', borderRadius: '50%',
          width: 500, height: 500, bottom: '5%', left: '-8%',
          background: 'radial-gradient(circle, rgba(100,30,200,0.07) 0%, transparent 70%)',
        }} />

        {/* Planeta grande decorativo */}
        <div style={{
          position: 'absolute', borderRadius: '50%',
          width: 180, height: 180, bottom: '8%', right: '2%',
          background: 'radial-gradient(circle at 35% 35%, #1a3a6e, #050b18)',
          opacity: 0.08,
          boxShadow: '0 0 40px rgba(26, 86, 255, 0.15)',
        }} />
      </div>

      {/* Cohetes */}
      <div className="rocket" aria-hidden="true" style={{ bottom: 0, left: 0 }}>🚀</div>
      <div className="rocket rocket-2" aria-hidden="true" style={{ bottom: 0, left: '-20px' }}>🛸</div>

      {/* Mascotas — mix-blend-mode screen elimina el fondo blanco */}
      <img
        src="/images/mascota1.jpg"
        alt=""
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: '2vh',
          right: '2vw',
          height: '22vh',
          width: 'auto',
          objectFit: 'contain',
          mixBlendMode: 'screen',
          opacity: 0.6,
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'float 7s ease-in-out infinite',
        }}
      />
      <img
        src="/images/mascota2.jpg"
        alt=""
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: '2vh',
          left: '2vw',
          height: '20vh',
          width: 'auto',
          objectFit: 'contain',
          mixBlendMode: 'screen',
          opacity: 0.55,
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'float 9s ease-in-out infinite',
          animationDelay: '3s',
        }}
      />
    </>
  )
}
