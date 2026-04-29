import React, { useState, useEffect } from 'react'
import { ROSE, ROSE_DARK, CREAM, BLUSH, CHARCOAL, GOLD, PETALS, PHOTO, WHATSAPP_NUMBER, WHATSAPP_MSG } from '../constants'
import { supabase } from '../lib/supabase'

const BG = `linear-gradient(160deg, #1a100e 0%, #2d1410 50%, #1a100e 100%)`

const PHOTO_TEMPLATES = {
  rosa:    { bg: 'linear-gradient(135deg, #C4887A 0%, #9E6055 50%, #7a3d32 100%)', phrase: 'Cuidar de você é o nosso maior presente.' },
  dourado: { bg: 'linear-gradient(135deg, #C9A96E 0%, #a07840 50%, #6b4e28 100%)', phrase: 'Você merece o melhor cuidado do mundo.' },
  floral:  { bg: 'linear-gradient(135deg, #d4a0b0 0%, #b07090 50%, #7a3d55 100%)', phrase: 'Para a mulher mais especial da minha vida.' },
  moderno: { bg: 'linear-gradient(135deg, #3a2a2a 0%, #1a100e 50%, #0d0808 100%)', phrase: 'Um presente à altura de quem você é.' },
}

function Petals({ count = 16 }) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: PETALS[i % PETALS.length],
    left: `${(i * (100 / count)) % 100}%`,
    size: 12 + (i % 4) * 5,
    duration: 5 + (i % 5) * 2,
    delay: -(i * 0.9),
  }))
  return (
    <>
      {items.map(p => (
        <span key={p.id} className="petal" style={{ left: p.left, bottom: '-40px', fontSize: p.size, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }}>
          {p.emoji}
        </span>
      ))}
    </>
  )
}

function NavDots({ current, total, onClick }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', position: 'absolute', bottom: 28, left: 0, right: 0, zIndex: 10 }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          onClick={() => onClick && i < current && onClick(i)}
          style={{
            width: i === current ? 20 : 7, height: 7,
            borderRadius: 4,
            background: i === current ? ROSE : i < current ? 'rgba(196,136,122,0.4)' : 'rgba(255,255,255,0.15)',
            transition: 'all 0.3s ease',
            cursor: i < current ? 'pointer' : 'default',
          }}
        />
      ))}
    </div>
  )
}

function NextBtn({ onClick, label = 'Continuar →' }) {
  return (
    <button
      onClick={onClick}
      className="cta-btn"
      style={{
        background: `linear-gradient(135deg, ${ROSE}, ${ROSE_DARK})`,
        color: '#fff', border: 'none', cursor: 'pointer',
        padding: '14px 36px', borderRadius: 50,
        fontSize: 15, fontWeight: 700, letterSpacing: 0.5,
        fontFamily: "'Lato', sans-serif",
        boxShadow: `0 6px 24px rgba(196,136,122,0.4)`,
      }}
    >
      {label}
    </button>
  )
}

/* ── Tela 0: Envelope ── */
function ScreenEnvelope({ mae, de, onNext }) {
  return (
    <div
      onClick={onNext}
      style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none', position: 'relative' }}
    >
      <Petals />
      <div className="screen-enter" style={{ textAlign: 'center', zIndex: 1, padding: '0 32px' }}>
        <div style={{ fontSize: 80, marginBottom: 24, animation: 'heartbeat 1.8s ease infinite' }}>💌</div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: CREAM, marginBottom: 8 }}>
          {mae}, você tem um presente!
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 32, lineHeight: 1.6 }}>
          {de ? `Com amor de ${de} 🌸` : 'Com amor e carinho 🌸'}
        </p>
        <div style={{ display: 'inline-block', padding: '12px 32px', borderRadius: 50, border: `1px solid ${GOLD}`, color: GOLD, fontSize: 13, letterSpacing: 1.5, animation: 'fadeIn 1s 0.5s both' }}>
          Toque para abrir ✨
        </div>
      </div>
    </div>
  )
}

/* ── Tela 1: Introdução ── */
function ScreenIntro({ mae, de, onNext }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '40px 32px' }}>
      <Petals count={10} />
      <div className="screen-enter" style={{ textAlign: 'center', zIndex: 1, maxWidth: 360 }}>
        <div style={{ fontSize: 52, marginBottom: 24 }}>🌸</div>

        <p style={{ fontSize: 11, color: ROSE, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
          Dra. Valeria Cabral
        </p>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: CREAM, lineHeight: 1.3, marginBottom: 16 }}>
          Feliz Dia das Mães,<br /><em style={{ color: GOLD }}>{mae}</em>!
        </h2>

        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 36 }}>
          {de
            ? `${de} preparou algo muito especial para você. Uma surpresa pensada com todo o carinho do mundo.`
            : 'Alguém especial preparou algo muito especial para você. Uma surpresa pensada com todo o carinho do mundo.'}
        </p>

        <NextBtn onClick={onNext} label="Ver surpresa →" />
      </div>
      <NavDots current={1} total={4} />
    </div>
  )
}

/* ── Tela 2: Frase + Foto ── */
function ScreenPhoto({ lead, onNext }) {
  const tmpl    = PHOTO_TEMPLATES[lead.template] || PHOTO_TEMPLATES.rosa
  const hasMsg  = lead.msg && lead.msg.trim()
  const bgStyle = lead.foto_url
    ? `url(${lead.foto_url}) center/cover no-repeat`
    : tmpl.bg

  return (
    <div
      onClick={onNext}
      style={{ width: '100%', height: '100%', position: 'relative', background: bgStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none', overflow: 'hidden' }}
    >
      {/* overlay escuro para legibilidade */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.6) 100%)' }} />

      <Petals count={10} />

      <div className="screen-enter" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 32px', maxWidth: 400 }}>

        {/* frase do template */}
        <div style={{ marginBottom: hasMsg ? 28 : 0 }}>
          <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)' }}>✦</span>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 22, color: '#fff', lineHeight: 1.55, margin: '12px 0', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            "{tmpl.phrase}"
          </p>
          <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)' }}>✦</span>
        </div>

        {/* mensagem especial */}
        {hasMsg && (
          <div style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', borderRadius: 16, padding: '18px 20px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <p style={{ fontSize: 10, color: GOLD, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
              Mensagem especial
            </p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.9)', lineHeight: 1.65 }}>
              "{lead.msg}"
            </p>
            {lead.de && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>— {lead.de}</p>
            )}
          </div>
        )}
      </div>

      {/* assinatura da clínica */}
      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' }}>
          Dra. Valeria Cabral
        </p>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginTop: 2 }}>
          Toque para continuar
        </p>
      </div>

      <NavDots current={2} total={4} onClick={() => {}} />
    </div>
  )
}

/* ── Tela 3: Revelação do presente ── */
function ScreenReveal({ mae, onNext }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '40px 28px' }}>
      <Petals count={18} />
      <div className="screen-enter" style={{ textAlign: 'center', zIndex: 1, maxWidth: 360 }}>

        <div style={{ fontSize: 64, marginBottom: 20, animation: 'heartbeat 1.5s ease infinite' }}>🎁</div>

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: CREAM, lineHeight: 1.3, marginBottom: 12 }}>
          {mae}, você vai<br />receber um presente<br /><em style={{ color: GOLD }}>muito especial</em>
        </p>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 28 }}>
          Uma experiência exclusiva de cuidado e beleza preparada com carinho pela Dra. Valeria Cabral para celebrar este dia tão especial.
        </p>

        {/* itens do presente */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {[
            { icon: '🦷', text: 'Avaliação Dental completa' },
            { icon: '✨', text: 'Limpeza Profissional' },
            { icon: '🧴', text: 'Creme de Mão especial' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 16px', border: `1px solid rgba(201,169,110,0.15)` }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <p style={{ color: CREAM, fontSize: 14, fontWeight: 600 }}>{item.text}</p>
            </div>
          ))}
        </div>

        <NextBtn onClick={onNext} label="Ver meu cartão presente 🎀" />
      </div>
      <NavDots current={3} total={4} />
    </div>
  )
}

/* ── Tela 4: Cartão presente ── */
function ScreenCard({ lead }) {
  const { mae, de, msg } = lead

  function handleWhatsApp() {
    const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`
    window.open(wa, '_blank')
  }

  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '32px 20px 48px', position: 'relative' }}>
      <Petals count={20} />

      <div className="screen-enter" style={{ width: '100%', maxWidth: 400, zIndex: 1, background: `linear-gradient(145deg, ${BLUSH}, ${CREAM})`, borderRadius: 24, overflow: 'hidden', boxShadow: '0 12px 60px rgba(0,0,0,0.5)' }}>

        {/* topo dourado */}
        <div style={{ background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>Cartão Presente</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#fff', fontWeight: 600 }}>Dia das Mães 2025</p>
          </div>
          <span style={{ fontSize: 36 }}>🎀</span>
        </div>

        <div style={{ padding: '24px 24px 28px' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 11, color: ROSE_DARK, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            Presente Especial
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: CHARCOAL, lineHeight: 1.2, marginBottom: 4 }}>
            Para <em>{mae}</em>,
          </h1>
          {de && <p style={{ fontSize: 13, color: ROSE_DARK, marginBottom: 14 }}>Com amor de {de} 💕</p>}

          {msg && (
            <blockquote style={{ fontStyle: 'italic', color: '#5a3a32', fontSize: 14, lineHeight: 1.65, borderLeft: `3px solid ${ROSE}`, paddingLeft: 14, margin: '0 0 16px' }}>
              "{msg}"
            </blockquote>
          )}

          {/* itens */}
          <div style={{ background: 'rgba(196,136,122,0.08)', borderRadius: 14, padding: '16px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: ROSE_DARK, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Este presente inclui</p>
            {[
              { icon: '🦷', label: 'Avaliação Dental completa' },
              { icon: '✨', label: 'Limpeza Profissional' },
              { icon: '🧴', label: 'Creme de Mão especial' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <p style={{ fontSize: 13, color: CHARCOAL, fontWeight: 600 }}>{item.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
            <span style={{ fontSize: 14, color: GOLD }}>✦</span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          </div>

          <p style={{ fontSize: 11, color: 'rgba(90,58,50,0.55)', textAlign: 'center', lineHeight: 1.5 }}>
            Dra. Valeria Cabral · Odontologia Estética<br />
            Sujeito à disponibilidade de agenda.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="screen-slide-right" style={{ width: '100%', maxWidth: 400, marginTop: 20, zIndex: 1 }}>
        <button
          className="cta-btn"
          onClick={handleWhatsApp}
          style={{ width: '100%', background: '#25D366', color: '#fff', padding: '18px', borderRadius: 16, fontSize: 17, fontWeight: 700, letterSpacing: 0.5, boxShadow: '0 6px 28px rgba(37,211,102,0.4)', marginBottom: 10, border: 'none', cursor: 'pointer', fontFamily: "'Lato', sans-serif" }}
        >
          📲 Agendar pelo WhatsApp
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
          Fale diretamente com a Dra. Valeria para marcar sua consulta
        </p>
      </div>
    </div>
  )
}

/* ── Telas de sistema ── */
function ScreenLoading() {
  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Petals count={8} />
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'heartbeat 1.5s ease infinite' }}>🌸</div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Abrindo seu presente...</p>
      </div>
    </div>
  )
}

function ScreenError() {
  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💌</div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: CREAM, marginBottom: 8 }}>Presente não encontrado</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>
          O link pode ter expirado ou estar incorreto.<br />Peça para reenviar o cartão.
        </p>
      </div>
    </div>
  )
}

/* ── Orquestrador ── */
const SCREENS = ['envelope', 'intro', 'photo', 'reveal', 'card']

export default function GiftExperience({ id }) {
  const [screen, setScreen] = useState('loading')
  const [lead, setLead]     = useState(null)

  useEffect(() => {
    async function fetchLead() {
      const { data, error } = await supabase
        .from('leads')
        .select('mae, de, msg, template, foto_url')
        .eq('id', id)
        .single()

      if (error || !data) { setScreen('error'); return }

      setLead(data)

      supabase
        .from('leads')
        .update({ visualizado_at: new Date().toISOString() })
        .eq('id', id)
        .is('visualizado_at', null)
        .then(() => {})

      setScreen('envelope')
    }
    fetchLead()
  }, [id])

  function next() {
    setScreen(s => {
      const idx = SCREENS.indexOf(s)
      return SCREENS[Math.min(idx + 1, SCREENS.length - 1)]
    })
  }

  if (screen === 'loading')  return <ScreenLoading />
  if (screen === 'error')    return <ScreenError />
  if (screen === 'envelope') return <ScreenEnvelope mae={lead.mae} de={lead.de} onNext={next} />
  if (screen === 'intro')    return <ScreenIntro    mae={lead.mae} de={lead.de} onNext={next} />
  if (screen === 'photo')    return <ScreenPhoto lead={lead} onNext={next} />
  if (screen === 'reveal')   return <ScreenReveal   mae={lead.mae} onNext={next} />
  if (screen === 'card')     return <ScreenCard     lead={lead} />
}
