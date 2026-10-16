import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api, getErrorMessage } from '../../lib/api'
import { useRoleTheme } from '../../hooks/useRoleTheme'
import { MessageSquare, X, Send, Loader2, Bot, User, Minimize2, Maximize2, Sparkles } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  '¿Cómo reservo un espacio?',
  '¿Qué espacios hay disponibles?',
  '¿Cómo solicito un préstamo?',
  '¿Cómo reporto un problema?',
]

export default function AiChat() {
  const theme = useRoleTheme()
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy el asistente de CampusFlow 🚀 Puedo ayudarte a navegar la plataforma, encontrar espacios y responder tus dudas. ¿En qué te ayudo hoy?',
    },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const mutation = useMutation({
    mutationFn: (message: string) =>
      api.post<{ response: string }>('/ai/chat', {
        message,
        history: messages.slice(-6),
      }).then(r => r.data.response),
    onSuccess: (response) => {
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    },
    onError: (e) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Lo siento, hubo un error: ${getErrorMessage(e)}. Intenta de nuevo.`,
      }])
    },
  })

  const send = (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || mutation.isPending) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    mutation.mutate(msg)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* ── Botón flotante ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-white font-semibold text-sm shadow-2xl transition-all hover:scale-105"
          style={{
            background: theme.gradient,
            boxShadow: `0 8px 32px ${theme.accentGlow}`,
          }}
        >
          <Sparkles size={18} />
          Asistente IA
        </button>
      )}

      {/* ── Ventana del chat ── */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: 380,
            height: minimized ? 60 : 520,
            background: 'rgba(8,12,28,0.97)',
            border: `1px solid ${theme.accent}30`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${theme.accentGlow}`,
            transition: 'height 0.3s ease',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}20, ${theme.accentDark}15)`,
              borderBottom: `1px solid ${theme.accent}20`,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: theme.gradient }}>
                  <Bot size={16} className="text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Asistente CampusFlow</p>
                <p className="text-xs" style={{ color: theme.accentLight, opacity: 0.7 }}>
                  {mutation.isPending ? 'Escribiendo...' : 'En línea · IA activa'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: msg.role === 'assistant'
                          ? theme.gradient
                          : 'rgba(255,255,255,0.1)',
                      }}>
                      {msg.role === 'assistant'
                        ? <Bot size={13} className="text-white" />
                        : <User size={13} className="text-white" />}
                    </div>

                    {/* Burbuja */}
                    <div
                      className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={msg.role === 'assistant' ? {
                        background: 'rgba(255,255,255,0.06)',
                        border: `1px solid ${theme.accent}15`,
                        color: '#e2e8f0',
                        borderRadius: '4px 16px 16px 16px',
                      } : {
                        background: theme.gradient,
                        color: 'white',
                        borderRadius: '16px 4px 16px 16px',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Indicador de escritura */}
                {mutation.isPending && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: theme.gradient }}>
                      <Bot size={13} className="text-white" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                      style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.accent}15` }}>
                      {[0, 0.2, 0.4].map((d, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: theme.accentLight,
                            animation: `dot 1s ease-in-out ${d}s infinite`,
                          }} />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Sugerencias — solo al inicio */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                      style={{
                        background: `${theme.accent}15`,
                        color: theme.accentLight,
                        border: `1px solid ${theme.accent}25`,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 flex-shrink-0" style={{ borderTop: `1px solid ${theme.accent}15` }}>
                <div className="flex items-end gap-2 rounded-xl px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.accent}20` }}>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Escribe tu pregunta..."
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none"
                    style={{ maxHeight: 80 }}
                  />
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || mutation.isPending}
                    className="p-1.5 rounded-lg transition-all flex-shrink-0"
                    style={{
                      background: input.trim() ? theme.gradient : 'rgba(255,255,255,0.05)',
                      opacity: !input.trim() || mutation.isPending ? 0.5 : 1,
                    }}
                  >
                    {mutation.isPending
                      ? <Loader2 size={15} className="text-white animate-spin" />
                      : <Send size={15} className="text-white" />}
                  </button>
                </div>
                <p className="text-xs text-slate-600 text-center mt-1.5">
                  Powered by Groq · Llama 3.1
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes dot {
          0%,80%,100% { transform:scale(0.6); opacity:0.4; }
          40% { transform:scale(1.2); opacity:1; }
        }
      `}</style>
    </>
  )
}
