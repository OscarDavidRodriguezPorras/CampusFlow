export default function SpaceBackground() {
  const stars = Array.from({ length: 120 }, (_, i) => {
    const s = (i * 2654435761) >>> 0
    return {
      x: (s % 1000) / 10, y: ((s >> 10) % 1000) / 10,
      size: ((s >> 20) % 3) + 1, dur: 2 + ((s >> 4) % 4),
      delay: ((s >> 8) % 50) / 10, op: 0.4 + ((s >> 12) % 5) / 10,
    }
  })

  return (
    <>
      <div className="stars-layer" aria-hidden="true">
        {/* Estrellas */}
        {stars.map((s, i) => (
          <span key={i} className="star" style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            ['--dur' as string]: `${s.dur}s`,
            ['--delay' as string]: `${s.delay}s`,
            ['--max-op' as string]: s.op,
          }} />
        ))}

        {/* Nebulosas */}
        <div style={{ position:'absolute', borderRadius:'50%', width:600, height:600, top:'-10%', right:'-5%', background:'radial-gradient(circle,rgba(15,68,224,0.08) 0%,transparent 70%)' }} />
        <div style={{ position:'absolute', borderRadius:'50%', width:500, height:500, bottom:'5%', left:'-8%', background:'radial-gradient(circle,rgba(100,30,200,0.07) 0%,transparent 70%)' }} />

        {/* Planeta decorativo */}
        <div style={{
          position:'absolute', bottom:'10%', right:'3%',
          width:100, height:100, borderRadius:'50%',
          background:'radial-gradient(circle at 35% 35%,#1a3a6e,#050b18)',
          opacity:0.15,
          boxShadow:'0 0 40px rgba(26,86,255,0.15)',
          animation:'planetFloat 14s ease-in-out infinite',
        }}>
          <div style={{ position:'absolute', top:'44%', left:'-30%', width:'160%', height:'16%', borderRadius:'50%', border:'2px solid rgba(59,130,246,0.2)', transform:'rotateX(70deg)' }}/>
        </div>

        {/* Luna */}
        <div style={{
          position:'absolute', top:'12%', right:'20%',
          width:32, height:32, borderRadius:'50%',
          background:'radial-gradient(circle at 40% 40%,#cbd5e1,#475569)',
          opacity:0.12,
          boxShadow:'inset -6px -3px 10px rgba(0,0,0,0.5)',
          animation:'planetFloat 22s ease-in-out 4s infinite',
        }}/>

        {/* Planeta pequeño */}
        <div style={{
          position:'absolute', top:'60%', left:'5%',
          width:45, height:45, borderRadius:'50%',
          background:'radial-gradient(circle at 40% 35%,#312e81,#020617)',
          opacity:0.12,
          animation:'planetFloat 18s ease-in-out 8s infinite',
        }}/>
      </div>

      {/* Cohetes */}
      <div className="rocket" aria-hidden="true" style={{ bottom:0, left:0 }}>🚀</div>
      <div className="rocket rocket-2" aria-hidden="true" style={{ bottom:0, left:'-20px' }}>🛸</div>

      {/* Cometas */}
      {[{top:'10%',delay:0,dur:6},{top:'40%',delay:5,dur:8},{top:'75%',delay:11,dur:7}].map((c,i)=>(
        <div key={i} aria-hidden="true" style={{
          position:'fixed', top:c.top, left:'-200px',
          width:160, height:2,
          background:'linear-gradient(90deg,transparent,rgba(147,197,253,0.7),white)',
          borderRadius:2, pointerEvents:'none', zIndex:0,
          animation:`cometFly ${c.dur}s ease-in ${c.delay}s infinite`,
          boxShadow:'0 0 6px rgba(147,197,253,0.5)',
        }}/>
      ))}

      {/* Mascotas flotantes */}
      <img src="/images/mascota1.png" alt="" aria-hidden="true" style={{
        position:'fixed', bottom:'2vh', right:'2vw',
        height:'18vh', width:'auto', objectFit:'contain',
        opacity:0.85, pointerEvents:'none', zIndex:1,
        animation:'float 7s ease-in-out infinite',
        filter:'drop-shadow(0 0 12px rgba(59,130,246,0.4))',
      }}/>
      <img src="/images/mascota2.png" alt="" aria-hidden="true" style={{
        position:'fixed', bottom:'2vh', left:'2vw',
        height:'16vh', width:'auto', objectFit:'contain',
        opacity:0.8, pointerEvents:'none', zIndex:1,
        animation:'float 9s ease-in-out infinite',
        animationDelay:'3s',
        filter:'drop-shadow(0 0 12px rgba(59,130,246,0.4))',
      }}/>

      <style>{`
        @keyframes planetFloat {
          0%,100% { transform:translateY(0) rotate(0deg); }
          50% { transform:translateY(-12px) rotate(2deg); }
        }
        @keyframes cometFly {
          0%   { transform:translateX(0) translateY(0); opacity:0; }
          5%   { opacity:1; }
          100% { transform:translateX(120vw) translateY(20vh); opacity:0; }
        }
        @keyframes float {
          0%,100% { transform:translateY(0) rotate(-3deg); }
          50% { transform:translateY(-18px) rotate(3deg); }
        }
      `}</style>
    </>
  )
}
