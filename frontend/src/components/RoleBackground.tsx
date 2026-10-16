import type { UserRole } from '../types'

interface Props { role: UserRole }

// ── Estrellas compartidas ──────────────────────────────────────────────────
function Stars({ count = 120, color = 'white' }: { count?: number; color?: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const s = (i * 2654435761) >>> 0
        const x = (s % 1000) / 10
        const y = ((s >> 10) % 1000) / 10
        const size = ((s >> 20) % 3) + 1
        const dur = 2 + ((s >> 4) % 4)
        const delay = ((s >> 8) % 50) / 10
        const op = 0.3 + ((s >> 12) % 5) / 10
        return (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%', background: color,
            left: `${x}%`, top: `${y}%`, width: size, height: size,
            animation: `twinkle ${dur}s ease-in-out ${delay}s infinite`,
            opacity: 0,
            ['--max-op' as string]: op,
          }} />
        )
      })}
    </>
  )
}

// ── Fondo STUDENT — espacial azul ──────────────────────────────────────────
function StudentBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <Stars count={130} />

      {/* Nebulosas */}
      <div style={{ position:'absolute', borderRadius:'50%', width:700, height:700, top:'-15%', right:'-10%', background:'radial-gradient(circle,rgba(29,78,216,0.08) 0%,transparent 70%)' }} />
      <div style={{ position:'absolute', borderRadius:'50%', width:500, height:500, bottom:'5%', left:'-8%', background:'radial-gradient(circle,rgba(100,30,200,0.07) 0%,transparent 70%)' }} />
      <div style={{ position:'absolute', borderRadius:'50%', width:400, height:400, top:'40%', left:'40%', background:'radial-gradient(circle,rgba(59,130,246,0.05) 0%,transparent 70%)' }} />

      {/* Planeta grande derecha */}
      <div style={{
        position:'absolute', bottom:'12%', right:'4%',
        width:120, height:120, borderRadius:'50%',
        background:'radial-gradient(circle at 35% 35%,#1e3a6e,#050b18)',
        boxShadow:'0 0 40px rgba(29,78,216,0.2)',
        animation:'planetFloat 12s ease-in-out infinite',
      }}>
        {/* Anillo del planeta */}
        <div style={{
          position:'absolute', top:'45%', left:'-30%',
          width:'160%', height:'18%', borderRadius:'50%',
          border:'2px solid rgba(59,130,246,0.25)',
          transform:'rotateX(70deg)',
        }}/>
      </div>

      {/* Planeta pequeño izquierda */}
      <div style={{
        position:'absolute', top:'15%', left:'3%',
        width:55, height:55, borderRadius:'50%',
        background:'radial-gradient(circle at 40% 35%,#3730a3,#020617)',
        boxShadow:'0 0 20px rgba(99,102,241,0.3)',
        animation:'planetFloat 18s ease-in-out 3s infinite',
      }}/>

      {/* Cohetes volando */}
      {[
        { delay:0,  dur:16, size:'1.8rem', bottom:true  },
        { delay:8,  dur:22, size:'1.2rem', bottom:false },
        { delay:14, dur:19, size:'1.4rem', bottom:true  },
      ].map((r,i) => (
        <div key={i} style={{
          position:'fixed', fontSize:r.size, opacity:0.18, pointerEvents:'none',
          bottom: r.bottom ? 0 : undefined,
          top: !r.bottom ? '60%' : undefined,
          left:0,
          animation:`rocketFly${i%2===0?'A':'B'} ${r.dur}s linear ${r.delay}s infinite`,
        }}>🚀</div>
      ))}

      {/* Cometas */}
      {[
        { top:'8%',  delay:0,  dur:6  },
        { top:'45%', delay:4,  dur:8  },
        { top:'72%', delay:10, dur:7  },
      ].map((c,i) => (
        <div key={i} style={{
          position:'absolute', top:c.top, left:'-200px',
          width:180, height:2,
          background:'linear-gradient(90deg,transparent,rgba(147,197,253,0.8),white)',
          borderRadius:2,
          animation:`cometFly ${c.dur}s ease-in ${c.delay}s infinite`,
          boxShadow:'0 0 6px rgba(147,197,253,0.6)',
        }}/>
      ))}

      {/* Satélite orbitando */}
      <div style={{
        position:'absolute', top:'20%', right:'10%',
        width:200, height:200,
        animation:'orbit 20s linear infinite',
      }}>
        <div style={{
          position:'absolute', top:0, left:'50%',
          fontSize:'1rem', opacity:0.2,
          transform:'translateX(-50%)',
        }}>🛸</div>
      </div>

      {/* Luna */}
      <div style={{
        position:'absolute', top:'8%', right:'18%',
        width:35, height:35, borderRadius:'50%',
        background:'radial-gradient(circle at 40% 40%,#cbd5e1,#475569)',
        boxShadow:'inset -8px -4px 12px rgba(0,0,0,0.4), 0 0 15px rgba(203,213,225,0.15)',
        animation:'planetFloat 25s ease-in-out infinite',
      }}/>
    </div>
  )
}

// ── Fondo STAFF — verde operativo ──────────────────────────────────────────
function StaffBg() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, overflow:'hidden', pointerEvents:'none' }}>
      <Stars count={80} color='#86efac' />

      {/* Grid */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:`linear-gradient(rgba(16,185,129,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.04) 1px,transparent 1px)`,
        backgroundSize:'40px 40px',
      }}/>

      {/* Nebulosas verdes */}
      <div style={{ position:'absolute', borderRadius:'50%', width:600, height:600, top:'-10%', right:'-5%', background:'radial-gradient(circle,rgba(16,185,129,0.07) 0%,transparent 70%)' }}/>
      <div style={{ position:'absolute', borderRadius:'50%', width:400, height:400, bottom:'10%', left:'-5%', background:'radial-gradient(circle,rgba(5,150,105,0.06) 0%,transparent 70%)' }}/>

      {/* Planeta verde */}
      <div style={{
        position:'absolute', bottom:'8%', right:'5%',
        width:100, height:100, borderRadius:'50%',
        background:'radial-gradient(circle at 35% 30%,#065f46,#022c22)',
        boxShadow:'0 0 30px rgba(16,185,129,0.2)',
        animation:'planetFloat 15s ease-in-out infinite',
      }}>
        <div style={{ position:'absolute', top:'45%', left:'-25%', width:'150%', height:'16%', borderRadius:'50%', border:'2px solid rgba(16,185,129,0.2)', transform:'rotateX(70deg)' }}/>
      </div>

      {/* Partículas flotantes */}
      {Array.from({length:25},(_,i)=>{
        const s=(i*1234567891)>>>0
        return (
          <div key={i} style={{
            position:'absolute', borderRadius:'50%',
            left:`${(s%1000)/10}%`, top:`${((s>>10)%1000)/10}%`,
            width:2+((s>>20)%3), height:2+((s>>20)%3),
            background:'#10b981', opacity:0,
            animation:`particleFloat ${4+((s>>4)%6)}s ease-in-out ${((s>>8)%40)/10}s infinite`,
          }}/>
        )
      })}

      {/* Líneas de escaneo */}
      {[20,45,70,85].map((y,i)=>(
        <div key={i} style={{
          position:'absolute', top:`${y}%`, left:0, right:0, height:1,
          background:'linear-gradient(90deg,transparent,rgba(16,185,129,0.1),transparent)',
          animation:`scanLine 3s ease-in-out ${i*0.7}s infinite`,
        }}/>
      ))}

      {/* Cometas verdes */}
      {[{top:'15%',delay:2,dur:7},{top:'60%',delay:7,dur:9}].map((c,i)=>(
        <div key={i} style={{
          position:'absolute', top:c.top, left:'-200px',
          width:150, height:2,
          background:'linear-gradient(90deg,transparent,rgba(110,231,183,0.7),white)',
          borderRadius:2,
          animation:`cometFly ${c.dur}s ease-in ${c.delay}s infinite`,
          boxShadow:'0 0 6px rgba(110,231,183,0.5)',
        }}/>
      ))}

      {/* Cohete staff */}
      <div style={{
        position:'fixed', fontSize:'1.6rem', opacity:0.15, pointerEvents:'none',
        bottom:0, left:0,
        animation:'rocketFlyA 18s linear 2s infinite',
        filter:'hue-rotate(120deg)',
      }}>🚀</div>

      {/* Satélite */}
      <div style={{
        position:'absolute', top:'25%', left:'10%',
        width:160, height:160,
        animation:'orbit 25s linear infinite reverse',
      }}>
        <div style={{ position:'absolute', top:0, left:'50%', fontSize:'0.9rem', opacity:0.15, transform:'translateX(-50%)' }}>🛰️</div>
      </div>

      {/* Cruz de datos */}
      {[0,1,2,3].map(i=>(
        <div key={i} style={{
          position:'absolute',
          left:`${20+i*20}%`, top:`${30+((i*17)%40)}%`,
          width:1, height:30,
          background:`rgba(16,185,129,${0.05+i*0.02})`,
          animation:`dataBlip ${1.5+i*0.3}s ease-in-out ${i*0.4}s infinite`,
        }}/>
      ))}
    </div>
  )
}

// ── Fondo ADMIN — dorado premium ───────────────────────────────────────────
function AdminBg() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, overflow:'hidden', pointerEvents:'none' }}>
      <Stars count={90} color='#fde68a' />

      {/* Patrón hexagonal */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.04 }}>
        <defs>
          <pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="30,2 58,16 58,36 30,50 2,36 2,16" fill="none" stroke="#f59e0b" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)"/>
      </svg>

      {/* Nebulosas doradas y púrpura */}
      <div style={{ position:'absolute', borderRadius:'50%', width:700, height:700, top:'-20%', right:'-10%', background:'radial-gradient(circle,rgba(245,158,11,0.07) 0%,transparent 70%)' }}/>
      <div style={{ position:'absolute', borderRadius:'50%', width:500, height:500, bottom:'0%', left:'-8%', background:'radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 70%)' }}/>
      <div style={{ position:'absolute', borderRadius:'50%', width:300, height:300, top:'45%', right:'30%', background:'radial-gradient(circle,rgba(245,158,11,0.04) 0%,transparent 70%)' }}/>

      {/* Planeta dorado grande */}
      <div style={{
        position:'absolute', bottom:'5%', right:'3%',
        width:130, height:130, borderRadius:'50%',
        background:'radial-gradient(circle at 35% 30%,#78350f,#1c0a00)',
        boxShadow:'0 0 50px rgba(245,158,11,0.25)',
        animation:'planetFloat 14s ease-in-out infinite',
      }}>
        <div style={{ position:'absolute', top:'42%', left:'-35%', width:'170%', height:'20%', borderRadius:'50%', border:'2px solid rgba(245,158,11,0.2)', transform:'rotateX(70deg)' }}/>
        <div style={{ position:'absolute', top:'35%', left:'-45%', width:'190%', height:'15%', borderRadius:'50%', border:'1px solid rgba(245,158,11,0.1)', transform:'rotateX(70deg)' }}/>
      </div>

      {/* Planeta púrpura */}
      <div style={{
        position:'absolute', top:'10%', left:'5%',
        width:70, height:70, borderRadius:'50%',
        background:'radial-gradient(circle at 40% 35%,#4c1d95,#0d0020)',
        boxShadow:'0 0 25px rgba(124,58,237,0.3)',
        animation:'planetFloat 20s ease-in-out 5s infinite',
      }}/>

      {/* Partículas doradas y púrpura */}
      {Array.from({length:30},(_,i)=>{
        const s=(i*9876543210)>>>0
        const gold=(s>>15)%2===0
        return (
          <div key={i} style={{
            position:'absolute', borderRadius:'50%',
            left:`${(s%1000)/10}%`, top:`${((s>>10)%1000)/10}%`,
            width:2+((s>>18)%3), height:2+((s>>18)%3),
            background: gold?'#f59e0b':'#7c3aed',
            opacity:0,
            animation:`particleFloat ${3+((s>>5)%5)}s ease-in-out ${((s>>9)%35)/10}s infinite`,
            boxShadow: gold?'0 0 4px #f59e0b':'0 0 4px #7c3aed',
          }}/>
        )
      })}

      {/* Cometas dorados */}
      {[{top:'12%',delay:1,dur:5},{top:'50%',delay:6,dur:7},{top:'80%',delay:12,dur:6}].map((c,i)=>(
        <div key={i} style={{
          position:'absolute', top:c.top, left:'-200px',
          width:200, height:2,
          background:'linear-gradient(90deg,transparent,rgba(253,211,77,0.8),white)',
          borderRadius:2,
          animation:`cometFly ${c.dur}s ease-in ${c.delay}s infinite`,
          boxShadow:'0 0 8px rgba(253,211,77,0.6)',
        }}/>
      ))}

      {/* Cohetes admin */}
      {[{delay:0,size:'1.6rem'},{delay:11,size:'1.1rem'}].map((r,i)=>(
        <div key={i} style={{
          position:'fixed', fontSize:r.size, opacity:0.15, pointerEvents:'none',
          bottom:0, left:0,
          animation:`rocketFly${i===0?'A':'B'} ${14+i*4}s linear ${r.delay}s infinite`,
          filter:'sepia(1) hue-rotate(10deg) saturate(3)',
        }}>🚀</div>
      ))}

      {/* Círculos orbitales */}
      {[200,160,120].map((size,i)=>(
        <div key={i} style={{
          position:'absolute', right:`calc(3% - ${(size-120)/2}px)`, top:`calc(10% - ${(size-120)/2}px)`,
          width:size, height:size, borderRadius:'50%',
          border:`1px solid rgba(${i===0?'245,158,11':i===1?'124,58,237':'245,158,11'},${0.06-i*0.01})`,
          animation:`orbit ${15+i*5}s linear ${i%2===0?'':'reverse'} infinite`,
        }}/>
      ))}

      {/* Estación espacial */}
      <div style={{
        position:'absolute', top:'30%', right:'15%',
        fontSize:'1.4rem', opacity:0.12,
        animation:'orbit 30s linear infinite',
      }}>🛸</div>

      {/* Asteroides */}
      {[{x:'15%',y:'70%',s:'0.7rem',d:8},{x:'80%',y:'30%',s:'0.5rem',d:12},{x:'50%',y:'85%',s:'0.6rem',d:10}].map((a,i)=>(
        <div key={i} style={{
          position:'absolute', left:a.x, top:a.y,
          fontSize:a.s, opacity:0.1,
          animation:`asteroide ${a.d}s linear ${i*3}s infinite`,
        }}>🪨</div>
      ))}
    </div>
  )
}

export default function RoleBackground({ role }: Props) {
  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%,100% { opacity:0; transform:scale(0.8); }
          50% { opacity:var(--max-op,0.7); transform:scale(1.2); }
        }
        @keyframes planetFloat {
          0%,100% { transform:translateY(0) rotate(0deg); }
          50% { transform:translateY(-14px) rotate(2deg); }
        }
        @keyframes rocketFlyA {
          0%   { transform:translate(-80px,110vh) rotate(-45deg); opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:1; }
          100% { transform:translate(110vw,-80px) rotate(-45deg); opacity:0; }
        }
        @keyframes rocketFlyB {
          0%   { transform:translate(-80px,70vh) rotate(-35deg); opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:1; }
          100% { transform:translate(110vw,10vh) rotate(-35deg); opacity:0; }
        }
        @keyframes cometFly {
          0%   { transform:translateX(0) translateY(0); opacity:0; }
          5%   { opacity:1; }
          100% { transform:translateX(120vw) translateY(20vh); opacity:0; }
        }
        @keyframes orbit {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
        @keyframes particleFloat {
          0%,100% { opacity:0; transform:translateY(0) scale(0.8); }
          50% { opacity:0.6; transform:translateY(-15px) scale(1.2); }
        }
        @keyframes scanLine {
          0%   { transform:translateX(-100%); opacity:0; }
          50%  { opacity:1; }
          100% { transform:translateX(100%); opacity:0; }
        }
        @keyframes dataBlip {
          0%,100% { opacity:0; transform:scaleY(0.5); }
          50% { opacity:1; transform:scaleY(1.5); }
        }
        @keyframes asteroide {
          0%   { transform:translate(0,0) rotate(0deg); opacity:0.1; }
          50%  { opacity:0.15; }
          100% { transform:translate(30px,20px) rotate(360deg); opacity:0.1; }
        }
        @keyframes float {
          0%,100% { transform:translateY(0) rotate(-3deg); }
          50% { transform:translateY(-18px) rotate(3deg); }
        }
      `}</style>

      {role === 'student' && <StudentBg />}
      {role === 'admin'   && <AdminBg />}
    </>
  )
}
