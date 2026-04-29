import React, { useState, useEffect, useRef } from 'react'
import { ROSE, ROSE_DARK, CREAM, BLUSH, CHARCOAL, GOLD, PETALS } from '../constants'
import { supabase } from '../lib/supabase'

function maskPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2)  return digits.length ? `(${digits}` : ''
  if (digits.length <= 6)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
}

/* ─── Paleta light ─── */
const L = {
  bg:      '#FAF7F5',
  surface: '#FFFFFF',
  border:  '#EAD9D0',
  text:    '#2A2320',
  muted:   '#9A8078',
  rose:    ROSE,
  roseDk:  ROSE_DARK,
  gold:    GOLD,
  blush:   BLUSH,
}

const PHOTO_TEMPLATES = [
  { id: 'rosa',    label: 'Rosa Clássico',    emoji: '🌸', bg: 'linear-gradient(135deg, #C4887A 0%, #9E6055 50%, #7a3d32 100%)', phrase: 'Cuidar de você é o nosso maior presente.' },
  { id: 'dourado', label: 'Dourado Elegante', emoji: '✨', bg: 'linear-gradient(135deg, #C9A96E 0%, #a07840 50%, #6b4e28 100%)', phrase: 'Você merece o melhor cuidado do mundo.' },
  { id: 'floral',  label: 'Floral Suave',     emoji: '🌺', bg: 'linear-gradient(135deg, #d4a0b0 0%, #b07090 50%, #7a3d55 100%)', phrase: 'Para a mulher mais especial da minha vida.' },
  { id: 'moderno', label: 'Moderno Escuro',   emoji: '🖤', bg: 'linear-gradient(135deg, #3a2a2a 0%, #1a100e 50%, #0d0808 100%)', phrase: 'Um presente à altura de quem você é.' },
]

const MSG_TEMPLATES = [
  { id: 1, label: 'Amor eterno',        text: 'Você é meu maior amor. Que esse presente seja um pequeno gesto do quanto você merece ser cuidada e mimada todos os dias. Feliz Dia das Mães! 💕' },
  { id: 2, label: 'Gratidão',           text: 'Obrigada por tudo que você faz por mim. Hoje quero te presentear com um cuidado especial, porque ninguém merece mais do que você. Te amo demais!' },
  { id: 3, label: 'Força e inspiração', text: 'Você é minha inspiração e minha força. Que esse presente traga um momento só seu, de cuidado e carinho. Feliz Dia das Mães, mamãe!' },
  { id: 4, label: 'Simples e do coração', text: 'Mãe, esse presente é pra você se sentir tão especial quanto você é pra mim. Com todo meu amor! 🌸' },
]

function Petals({ count = 12 }) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: PETALS[i % PETALS.length],
    left: `${(i * (100 / count)) % 100}%`,
    size: 12 + (i % 3) * 5,
    duration: 6 + (i % 4) * 2,
    delay: -(i * 1.1),
  }))
  return (
    <>
      {items.map(p => (
        <span key={p.id} className="petal" style={{ left: p.left, bottom: '-40px', fontSize: p.size, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`, opacity: 0.35 }}>
          {p.emoji}
        </span>
      ))}
    </>
  )
}

function StepDots({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 7, height: 7,
          borderRadius: 4,
          background: i === current ? L.rose : '#DDD0CB',
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  )
}

function FieldLabel({ children }) {
  return (
    <label style={{ display: 'block', fontSize: 11, color: L.rose, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 7, fontWeight: 700 }}>
      {children}
    </label>
  )
}

function Input({ value, onChange, placeholder, maxLength, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{
        width: '100%',
        background: L.surface,
        color: L.text,
        padding: '14px 16px',
        borderRadius: 12,
        fontSize: 15,
        border: `1.5px solid ${L.border}`,
        fontFamily: "'Lato', sans-serif",
        outline: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    />
  )
}

function PrimaryBtn({ onClick, children, type = 'button', disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="cta-btn"
      style={{
        width: '100%',
        background: disabled ? '#E8D0CB' : `linear-gradient(135deg, ${L.rose} 0%, ${L.roseDk} 100%)`,
        color: disabled ? '#BFA09A' : '#fff',
        padding: '16px',
        borderRadius: 14,
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: 0.5,
        boxShadow: disabled ? 'none' : `0 6px 20px rgba(196,136,122,0.3)`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        fontFamily: "'Lato', sans-serif",
      }}
    >
      {children}
    </button>
  )
}

function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="cta-btn"
      style={{ width: '100%', background: 'transparent', color: L.muted, padding: '10px', borderRadius: 10, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: "'Lato', sans-serif", marginTop: 8 }}
    >
      ← Voltar
    </button>
  )
}

/* ─── TELA INICIAL ─── */
function ScreenWelcome({ onStart }) {
  return (
    <div style={{ width: '100%', height: '100%', background: L.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', overflowY: 'auto' }}>
      <Petals count={14} />
      <div className="screen-enter" style={{ width: '100%', maxWidth: 400, zIndex: 1, textAlign: 'center' }}>

        <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${L.rose}, ${L.roseDk})`, margin: '0 auto 16px', boxShadow: `0 8px 24px rgba(196,136,122,0.3)` }} />

        <p style={{ fontSize: 11, color: L.rose, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
          Dra. Valeria Cabral
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: L.text, lineHeight: 1.2, marginBottom: 6 }}>
          Campanha Dia das Mães
        </h1>
        <p style={{ fontSize: 13, color: L.muted, marginBottom: 28 }}>
          Presenteie a mamãe com um cuidado especial 💕
        </p>

        {/* gift items */}
        <div style={{ background: L.surface, border: `1px solid ${L.border}`, borderRadius: 18, padding: '20px', marginBottom: 28, textAlign: 'left', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 11, color: L.gold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14, textAlign: 'center', fontWeight: 700 }}>
            O presente inclui
          </p>
          {[
            { icon: '🦷', title: 'Avaliação Dental',   desc: 'Consulta completa e personalizada' },
            { icon: '✨', title: 'Limpeza Profissional', desc: 'Profilaxia com cuidado e atenção' },
            { icon: '🧴', title: 'Creme de Mão',        desc: 'Mimos especiais para a mamãe' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: i < 2 ? 14 : 0 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `rgba(196,136,122,0.1)`, border: `1px solid rgba(196,136,122,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <p style={{ color: L.text, fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{item.title}</p>
                <p style={{ color: L.muted, fontSize: 12 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <PrimaryBtn onClick={onStart}>
          Criar meu cartão presente ✨
        </PrimaryBtn>

        <p style={{ fontSize: 11, color: '#BBA09A', marginTop: 16, lineHeight: 1.5 }}>
          Sujeito à disponibilidade de agenda.<br />Válido para consulta presencial.
        </p>
      </div>
    </div>
  )
}

/* ─── ETAPA 1: dados ─── */
function Step1({ data, onChange, onNext, onBack }) {
  const [checking, setChecking] = useState(false)
  const [duplicate, setDuplicate] = useState(null)

  const valid = data.mae.trim() && data.de.trim() && data.waMae.trim() && data.waDe.trim() && !duplicate

  async function checkDuplicate() {
    const digits = data.waMae.replace(/\D/g, '')
    if (digits.length < 10) return
    setChecking(true)
    const { data: rows } = await supabase.from('leads').select('mae, wa_mae')
    setChecking(false)
    const match = (rows || []).find(r => r.wa_mae && r.wa_mae.replace(/\D/g, '') === digits)
    if (match) setDuplicate(match)
    else setDuplicate(null)
  }

  function handleNext() {
    if (duplicate) return
    onNext()
  }

  return (
    <>
      {/* ── Popup de duplicado ── */}
      {duplicate && (
        <div
          onClick={() => setDuplicate(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(42,35,32,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', width: '100%', maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}
          >
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>
              ⚠️
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#2A2320', marginBottom: 8 }}>
              Número já cadastrado
            </h3>
            <p style={{ fontSize: 13, color: '#8A7672', lineHeight: 1.6, marginBottom: 20 }}>
              Este número já está cadastrado e não pode receber outro cartão. Verifique o número e tente novamente.
            </p>
            <button
              onClick={() => setDuplicate(null)}
              style={{ width: '100%', background: 'linear-gradient(135deg, #C4887A, #9E6055)', color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Lato', sans-serif" }}
            >
              Entendido, vou corrigir
            </button>
          </div>
        </div>
      )}

      <div style={{ width: '100%', height: '100%', background: L.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', overflowY: 'auto' }}>
        <div className="screen-slide-right" style={{ width: '100%', maxWidth: 420, zIndex: 1 }}>
          <StepDots current={0} total={4} />

          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: L.text, marginBottom: 4 }}>
            Sobre o presente 🎁
          </p>
          <p style={{ fontSize: 13, color: L.muted, marginBottom: 24 }}>
            Preencha os dados de quem vai dar e receber
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <FieldLabel>Nome da mamãe *</FieldLabel>
              <Input value={data.mae} onChange={e => onChange('mae', e.target.value)} placeholder="Ex: Maria, Vovó, Mãe..." maxLength={40} />
            </div>

            <div>
              <FieldLabel>WhatsApp da mamãe *</FieldLabel>
              <input
                type="tel"
                value={data.waMae}
                onChange={e => { onChange('waMae', maskPhone(e.target.value)); setDuplicate(null) }}
                onBlur={checkDuplicate}
                placeholder="(11) 99999-9999"
                maxLength={16}
                style={{ width: '100%', background: duplicate ? '#FFF0EE' : L.surface, color: L.text, padding: '14px 16px', borderRadius: 12, fontSize: 15, border: `1.5px solid ${duplicate ? '#C4887A' : L.border}`, fontFamily: "'Lato', sans-serif", outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', boxSizing: 'border-box' }}
              />
              {checking && <p style={{ fontSize: 11, color: L.muted, marginTop: 5 }}>Verificando número...</p>}
            </div>

            <div style={{ height: 1, background: L.border, margin: '4px 0' }} />

            <div>
              <FieldLabel>Quem presenteia *</FieldLabel>
              <Input value={data.de} onChange={e => onChange('de', e.target.value)} placeholder="Ex: João, seus filhos..." maxLength={40} />
            </div>

            <div>
              <FieldLabel>WhatsApp de quem presenteia *</FieldLabel>
              <Input value={data.waDe} onChange={e => onChange('waDe', maskPhone(e.target.value))} placeholder="(11) 99999-9999" maxLength={16} type="tel" />
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <PrimaryBtn onClick={handleNext} disabled={!valid}>
              Próximo — Mensagem especial →
            </PrimaryBtn>
            <BackBtn onClick={onBack} />
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── ETAPA 2: mensagem ─── */
function Step2({ msg, onMsg, onNext, onBack }) {
  const [mode, setMode] = useState('template')
  const [selected, setSelected] = useState(null)

  function handleSelectTemplate(t) {
    setSelected(t.id)
    onMsg(t.text)
  }

  function handleCustomChange(e) {
    setSelected(null)
    onMsg(e.target.value)
  }

  const valid = msg.trim().length > 0

  return (
    <div style={{ width: '100%', height: '100%', background: L.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px 48px', overflowY: 'auto' }}>
      <div className="screen-slide-right" style={{ width: '100%', maxWidth: 420, zIndex: 1 }}>
        <StepDots current={1} total={4} />

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: L.text, marginBottom: 4 }}>
          Mensagem especial 💌
        </p>
        <p style={{ fontSize: 13, color: L.muted, marginBottom: 20 }}>
          Escolha um modelo ou escreva do coração
        </p>

        {/* toggle */}
        <div style={{ display: 'flex', background: L.border, borderRadius: 10, padding: 4, marginBottom: 20 }}>
          {[['template', '✨ Usar modelo'], ['custom', '✏️ Escrever']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              style={{
                flex: 1, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: mode === key ? L.rose : 'transparent',
                color: mode === key ? '#fff' : L.muted,
                fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 700,
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'template' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MSG_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                style={{
                  textAlign: 'left', padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                  border: `1.5px solid ${selected === t.id ? L.rose : L.border}`,
                  background: selected === t.id ? 'rgba(196,136,122,0.07)' : L.surface,
                  transition: 'all 0.2s', fontFamily: "'Lato', sans-serif",
                  boxShadow: selected === t.id ? `0 0 0 3px rgba(196,136,122,0.12)` : '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                <p style={{ fontSize: 12, color: selected === t.id ? L.rose : L.gold, fontWeight: 700, letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>
                  {t.label}
                </p>
                <p style={{ fontSize: 13, color: L.muted, lineHeight: 1.55 }}>{t.text}</p>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <textarea
              value={msg}
              onChange={handleCustomChange}
              placeholder="Escreva sua mensagem do coração..."
              maxLength={250}
              rows={5}
              style={{
                width: '100%',
                background: L.surface,
                color: L.text,
                padding: '14px 16px',
                borderRadius: 12,
                fontSize: 15,
                border: `1.5px solid ${L.border}`,
                fontFamily: "'Lato', sans-serif",
                outline: 'none',
                resize: 'none',
                lineHeight: 1.6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            />
            <p style={{ fontSize: 11, color: '#BBA09A', textAlign: 'right', marginTop: 4 }}>
              {msg.length}/250
            </p>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <PrimaryBtn onClick={onNext} disabled={!valid}>
            Ver cartão pronto →
          </PrimaryBtn>
          <BackBtn onClick={onBack} />
        </div>
      </div>
    </div>
  )
}

/* ─── ETAPA 3: foto / template ─── */
function Step3Photo({ template, fotoUrl, onTemplate, onFoto, onNext, onBack }) {
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const selected = PHOTO_TEMPLATES.find(t => t.id === template) || PHOTO_TEMPLATES[0]

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setUploadErr('Foto muito grande. Máximo 5MB.'); return }
    setUploadErr('')
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('fotos').upload(path, file, { upsert: true })
    if (error) {
      setUploadErr('Erro ao enviar foto. Tente novamente.')
      console.error('[supabase] upload foto:', error.message)
    } else {
      const { data: pub } = supabase.storage.from('fotos').getPublicUrl(path)
      onFoto(pub.publicUrl)
    }
    setUploading(false)
  }

  function handleRemoveFoto() { onFoto(null) }

  return (
    <div style={{ width: '100%', height: '100%', background: L.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', overflowY: 'auto' }}>
      <div className="screen-slide-right" style={{ width: '100%', maxWidth: 420, zIndex: 1 }}>
        <StepDots current={2} total={4} />

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: L.text, marginBottom: 4 }}>
          Foto do cartão 📸
        </p>
        <p style={{ fontSize: 13, color: L.muted, marginBottom: 24 }}>
          Escolha um template ou envie uma foto
        </p>

        {/* preview */}
        <div style={{
          width: '100%', height: 160, borderRadius: 16, marginBottom: 20, overflow: 'hidden',
          background: fotoUrl ? `url(${fotoUrl}) center/cover no-repeat` : selected.bg,
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'flex-end',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
          <div style={{ padding: '14px 16px', zIndex: 1 }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4 }}>
              "{selected.phrase}"
            </p>
          </div>
          {fotoUrl && (
            <button onClick={handleRemoveFoto} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: 50, width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          )}
        </div>

        {/* templates */}
        {!fotoUrl && (
          <>
            <p style={{ fontSize: 11, color: L.rose, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
              Cor do fundo
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {PHOTO_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => onTemplate(t.id)}
                  title={t.label}
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: t.bg, border: 'none', cursor: 'pointer', padding: 0,
                    outline: template === t.id ? `3px solid ${L.rose}` : '3px solid transparent',
                    outlineOffset: 2,
                    boxShadow: template === t.id ? `0 0 12px rgba(196,136,122,0.4)` : 'none',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {template === t.id && (
                    <span style={{ color: '#fff', fontSize: 14, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {/* upload */}
        <p style={{ fontSize: 11, color: L.rose, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
          {fotoUrl ? 'Foto enviada' : 'Ou enviar uma foto'}
        </p>

        {!fotoUrl ? (
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: L.surface, border: `1.5px dashed ${L.border}`,
            borderRadius: 12, padding: '16px', cursor: 'pointer', marginBottom: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <span style={{ fontSize: 20 }}>{uploading ? '⏳' : '📷'}</span>
            <span style={{ color: L.muted, fontSize: 13, fontFamily: "'Lato', sans-serif" }}>
              {uploading ? 'Enviando...' : 'Toque para escolher foto (máx. 5MB)'}
            </span>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={uploading} />
          </label>
        ) : (
          <button
            onClick={handleRemoveFoto}
            style={{ width: '100%', background: L.surface, border: `1.5px solid ${L.border}`, borderRadius: 12, padding: '12px', color: L.muted, fontSize: 13, cursor: 'pointer', fontFamily: "'Lato', sans-serif", marginBottom: 8 }}
          >
            🗑 Remover foto e usar template
          </button>
        )}

        {uploadErr && <p style={{ fontSize: 12, color: '#e05252', marginBottom: 8 }}>{uploadErr}</p>}

        <div style={{ marginTop: 12 }}>
          <PrimaryBtn onClick={onNext} disabled={uploading}>
            Próximo — Ver cartão →
          </PrimaryBtn>
          <BackBtn onClick={onBack} />
        </div>
      </div>
    </div>
  )
}

/* ─── ETAPA 4: cartão pronto ─── */
function Step4({ data, onBack }) {
  const [copied, setCopied]   = useState(false)
  const [sent, setSent]       = useState(false)
  const [link, setLink]       = useState(null)
  const [saving, setSaving]   = useState(false)
  const [saveErr, setSaveErr] = useState(false)

  const savedRef = useRef(false)
  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true
    async function saveLeadAndBuildLink() {
      setSaving(true)
      const base = window.location.origin + window.location.pathname
      const { data: row, error } = await supabase.from('leads').insert({
        mae:      data.mae,
        wa_mae:   data.waMae,
        de:       data.de      || null,
        wa_de:    data.waDe    || null,
        msg:      data.msg     || null,
        template: data.template || 'rosa',
        foto_url: data.fotoUrl || null,
      }).select('id').single()

      if (error) {
        console.error('[supabase] insert lead:', error.code, error.message)
        setSaveErr(true)
      } else {
        const finalLink = `${base}?id=${row.id}`
        supabase.from('leads').update({ link: finalLink }).eq('id', row.id).then(() => {})
        setLink(finalLink)
      }
      setSaving(false)
    }
    saveLeadAndBuildLink()
  }, [])

  function handleCopy() {
    if (!link) return
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function handleWhatsApp() {
    if (!link) return
    const waNum = data.waMae.replace(/\D/g, '')
    const text  = encodeURIComponent(`🌸 *Feliz Dia das Mães, ${data.mae}!*\n\nVocê tem um presente especial esperando por você. Toque no link para abrir:\n\n${link}\n\n_Com amor de ${data.de}_ 💕`)
    window.open(`https://wa.me/55${waNum}?text=${text}`, '_blank')
    setSent(true)
  }

  return (
    <div style={{ width: '100%', height: '100%', background: L.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 48px', overflowY: 'auto' }}>
      <div className="screen-slide-right" style={{ width: '100%', maxWidth: 420, zIndex: 1 }}>
        <StepDots current={3} total={4} />

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: L.gold, textAlign: 'center', marginBottom: 20 }}>
          {sent ? 'Presente enviado! 🎉' : 'Seu cartão está pronto! ✨'}
        </p>

        {/* card preview */}
        <div style={{ background: `linear-gradient(145deg, ${BLUSH}, ${CREAM})`, border: `1px solid ${L.border}`, borderRadius: 20, padding: '24px 20px', marginBottom: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 11, color: L.roseDk, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            Dra. Valeria Cabral — Dia das Mães
          </p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: CHARCOAL, marginBottom: 4 }}>
            Para: <em>{data.mae}</em>
          </p>
          {data.de && (
            <p style={{ fontSize: 12, color: L.roseDk, marginBottom: 8 }}>Com amor de: {data.de}</p>
          )}
          {data.msg && (
            <p style={{ fontStyle: 'italic', color: '#5a3a32', fontSize: 13, lineHeight: 1.6, borderLeft: `3px solid ${L.rose}`, paddingLeft: 12, marginBottom: 12 }}>
              "{data.msg}"
            </p>
          )}
          <div style={{ background: `linear-gradient(135deg, ${L.rose}, ${L.roseDk})`, borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>🎁 Avaliação + Limpeza + Creme de Mão</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>Presente exclusivo Dia das Mães 2025</p>
          </div>
        </div>

        {/* link */}
        {saveErr ? (
          <p style={{ fontSize: 13, color: '#e05252', textAlign: 'center', marginBottom: 14, lineHeight: 1.5 }}>
            Erro ao salvar o cartão. Verifique a conexão e tente novamente.
          </p>
        ) : (
          <div style={{ background: L.surface, border: `1px solid ${L.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, minHeight: 48, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {saving || !link ? (
              <p style={{ flex: 1, fontSize: 12, color: '#BBA09A', fontStyle: 'italic' }}>
                Gerando link seguro...
              </p>
            ) : (
              <>
                <p style={{ flex: 1, fontSize: 11, color: L.muted, wordBreak: 'break-all', lineHeight: 1.4 }}>
                  {link}
                </p>
                <button
                  className="cta-btn"
                  onClick={handleCopy}
                  style={{ flexShrink: 0, background: copied ? L.gold : L.blush, color: copied ? '#fff' : L.roseDk, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Lato', sans-serif" }}
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </>
            )}
          </div>
        )}

        <button
          className="cta-btn"
          onClick={handleWhatsApp}
          disabled={!link || saving}
          style={{
            width: '100%',
            background: !link || saving ? '#A8E0BB' : '#25D366',
            color: '#fff',
            padding: '16px',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 0.5,
            marginBottom: 10,
            boxShadow: !link || saving ? 'none' : '0 4px 16px rgba(37,211,102,0.3)',
            border: 'none',
            cursor: !link || saving ? 'not-allowed' : 'pointer',
            fontFamily: "'Lato', sans-serif",
          }}
        >
          {saving ? 'Preparando...' : `📲 Enviar para ${data.mae} pelo WhatsApp`}
        </button>

        {sent && (
          <p className="screen-enter" style={{ textAlign: 'center', fontSize: 12, color: L.gold, marginBottom: 8, lineHeight: 1.5 }}>
            Link enviado para o WhatsApp da {data.mae}! 🌸
          </p>
        )}

        <BackBtn onClick={onBack} />
      </div>
    </div>
  )
}

/* ─── ORQUESTRADOR ─── */
export default function FormModeLight() {
  const [screen, setScreen] = useState('welcome')
  const [data, setData] = useState({ mae: '', de: '', waMae: '', waDe: '', msg: '', template: 'rosa', fotoUrl: null })

  function change(key, val) {
    setData(d => ({ ...d, [key]: val }))
  }

  if (screen === 'welcome')   return <ScreenWelcome onStart={() => setScreen('step1')} />
  if (screen === 'step1')     return <Step1      data={data} onChange={change} onNext={() => setScreen('step2')} onBack={() => setScreen('welcome')} />
  if (screen === 'step2')     return <Step2      msg={data.msg} onMsg={v => change('msg', v)} onNext={() => setScreen('step3foto')} onBack={() => setScreen('step1')} />
  if (screen === 'step3foto') return <Step3Photo template={data.template} fotoUrl={data.fotoUrl} onTemplate={v => change('template', v)} onFoto={v => change('fotoUrl', v)} onNext={() => setScreen('step4')} onBack={() => setScreen('step2')} />
  if (screen === 'step4')     return <Step4      data={data} onBack={() => setScreen('step3foto')} />
}
