import React, { useState, useEffect, useRef } from 'react'
import { ROSE, ROSE_DARK, CREAM, BLUSH, CHARCOAL, GOLD, PETALS, APP_URL } from '../constants'
import { supabase } from '../lib/supabase'

function maskPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2)  return digits.length ? `(${digits}` : ''
  if (digits.length <= 6)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
}

const BG = `linear-gradient(160deg, #1a100e 0%, #2d1410 50%, #1a100e 100%)`

const PHOTO_TEMPLATES = [
  {
    id: 'rosa',
    label: 'Rosa Clássico',
    emoji: '🌸',
    bg: 'linear-gradient(135deg, #C4887A 0%, #9E6055 50%, #7a3d32 100%)',
    phrase: 'Cuidar de você é o nosso maior presente.',
  },
  {
    id: 'dourado',
    label: 'Dourado Elegante',
    emoji: '✨',
    bg: 'linear-gradient(135deg, #C9A96E 0%, #a07840 50%, #6b4e28 100%)',
    phrase: 'Você merece o melhor cuidado do mundo.',
  },
  {
    id: 'floral',
    label: 'Floral Suave',
    emoji: '🌺',
    bg: 'linear-gradient(135deg, #d4a0b0 0%, #b07090 50%, #7a3d55 100%)',
    phrase: 'Para a mulher mais especial da minha vida.',
  },
  {
    id: 'moderno',
    label: 'Moderno Escuro',
    emoji: '🖤',
    bg: 'linear-gradient(135deg, #3a2a2a 0%, #1a100e 50%, #0d0808 100%)',
    phrase: 'Um presente à altura de quem você é.',
  },
]

const MSG_TEMPLATES = [
  { id: 1, label: 'Amor eterno', text: 'Você é meu maior amor. Que esse presente seja um pequeno gesto do quanto você merece ser cuidada e mimada todos os dias. Feliz Dia das Mães! 💕' },
  { id: 2, label: 'Gratidão', text: 'Obrigada por tudo que você faz por mim. Hoje quero te presentear com um cuidado especial, porque ninguém merece mais do que você. Te amo demais!' },
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
        <span key={p.id} className="petal" style={{ left: p.left, bottom: '-40px', fontSize: p.size, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }}>
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
          background: i === current ? ROSE : 'rgba(255,255,255,0.15)',
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  )
}

function FieldLabel({ children }) {
  return (
    <label style={{ display: 'block', fontSize: 11, color: ROSE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 7, fontWeight: 700 }}>
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
        background: 'rgba(255,255,255,0.07)',
        color: CREAM,
        padding: '14px 16px',
        borderRadius: 12,
        fontSize: 15,
        border: `1px solid rgba(196,136,122,0.25)`,
        fontFamily: "'Lato', sans-serif",
        outline: 'none',
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
        background: disabled ? 'rgba(196,136,122,0.3)' : `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
        color: '#fff',
        padding: '16px',
        borderRadius: 14,
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: 0.5,
        boxShadow: disabled ? 'none' : `0 6px 24px rgba(196,136,122,0.35)`,
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
      style={{ width: '100%', background: 'transparent', color: 'rgba(255,255,255,0.4)', padding: '10px', borderRadius: 10, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: "'Lato', sans-serif", marginTop: 8 }}
    >
      ← Voltar
    </button>
  )
}

/* ─── TELA INICIAL ─── */
function ScreenWelcome({ onStart }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', overflowY: 'auto' }}>
      <Petals count={14} />
      <div className="screen-enter" style={{ width: '100%', maxWidth: 400, zIndex: 1, textAlign: 'center' }}>

        <div style={{ fontSize: 64, marginBottom: 16, animation: 'heartbeat 2s ease infinite' }}>🌸</div>

        <p style={{ fontSize: 11, color: ROSE, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
          Dra. Valeria Cabral
        </p>
        <h1 className="shimmer-text" style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, lineHeight: 1.2, marginBottom: 6 }}>
          Campanha Dia das Mães
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>
          Presenteie a mamãe com um cuidado especial 💕
        </p>

        {/* gift items */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 18, padding: '20px 20px', marginBottom: 28, textAlign: 'left' }}>
          <p style={{ fontSize: 11, color: GOLD, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14, textAlign: 'center', fontWeight: 700 }}>
            O presente inclui
          </p>
          {[
            { icon: '🦷', title: 'Avaliação Dental', desc: 'Consulta completa e personalizada' },
            { icon: '✨', title: 'Limpeza Profissional', desc: 'Profilaxia com cuidado e atenção' },
            { icon: '🧴', title: 'Creme de Mão', desc: 'Mimos especiais para a mamãe' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: i < 2 ? 14 : 0 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `rgba(196,136,122,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <p style={{ color: CREAM, fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{item.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <PrimaryBtn onClick={onStart}>
          Criar meu cartão presente ✨
        </PrimaryBtn>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 16, lineHeight: 1.5 }}>
          Sujeito à disponibilidade de agenda.<br />Válido para consulta presencial.
        </p>
      </div>
    </div>
  )
}

/* ─── ETAPA 1: dados ─── */
function Step1({ data, onChange, onNext, onBack }) {
  const valid = data.mae.trim() && data.de.trim() && data.waMae.trim() && data.waDe.trim()
  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', overflowY: 'auto' }}>
      <Petals count={10} />
      <div className="screen-slide-right" style={{ width: '100%', maxWidth: 420, zIndex: 1 }}>
        <StepDots current={0} total={4} />

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: CREAM, marginBottom: 4 }}>
          Sobre o presente 🎁
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
          Preencha os dados de quem vai dar e receber
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <FieldLabel>Nome da mamãe *</FieldLabel>
            <Input value={data.mae} onChange={e => onChange('mae', e.target.value)} placeholder="Ex: Maria, Vovó, Mãe..." maxLength={40} />
          </div>

          <div>
            <FieldLabel>WhatsApp da mamãe *</FieldLabel>
            <Input value={data.waMae} onChange={e => onChange('waMae', maskPhone(e.target.value))} placeholder="(11) 99999-9999" maxLength={16} type="tel" />
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />

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
          <PrimaryBtn onClick={onNext} disabled={!valid}>
            Próximo — Mensagem especial →
          </PrimaryBtn>
          <BackBtn onClick={onBack} />
        </div>
      </div>
    </div>
  )
}

/* ─── ETAPA 2: mensagem ─── */
function Step2({ msg, onMsg, onNext, onBack }) {
  const [mode, setMode] = useState('template') // 'template' | 'custom'
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
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px 48px', overflowY: 'auto' }}>
      <Petals count={10} />
      <div className="screen-slide-right" style={{ width: '100%', maxWidth: 420, zIndex: 1 }}>
        <StepDots current={1} total={4} />

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: CREAM, marginBottom: 4 }}>
          Mensagem especial 💌
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
          Escolha um modelo ou escreva do coração
        </p>

        {/* toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: 4, marginBottom: 20 }}>
          {[['template', '✨ Usar modelo'], ['custom', '✏️ Escrever']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              style={{
                flex: 1, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: mode === key ? ROSE : 'transparent',
                color: mode === key ? '#fff' : 'rgba(255,255,255,0.4)',
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
                  border: `1px solid ${selected === t.id ? ROSE : 'rgba(255,255,255,0.1)'}`,
                  background: selected === t.id ? 'rgba(196,136,122,0.15)' : 'rgba(255,255,255,0.04)',
                  transition: 'all 0.2s', fontFamily: "'Lato', sans-serif",
                }}
              >
                <p style={{ fontSize: 12, color: selected === t.id ? ROSE : GOLD, fontWeight: 700, letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>
                  {t.label}
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>{t.text}</p>
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
                background: 'rgba(255,255,255,0.07)',
                color: CREAM,
                padding: '14px 16px',
                borderRadius: 12,
                fontSize: 15,
                border: `1px solid rgba(196,136,122,0.25)`,
                fontFamily: "'Lato', sans-serif",
                outline: 'none',
                resize: 'none',
                lineHeight: 1.6,
              }}
            />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'right', marginTop: 4 }}>
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

/* ─── ETAPA 3: cartão pronto ─── */
function Step3({ data, onBack }) {
  const [copied, setCopied]   = useState(false)
  const [sent, setSent]       = useState(false)
  const [link, setLink]       = useState(null)
  const [saving, setSaving]   = useState(false)
  const [saveErr, setSaveErr] = useState(false)

  // salva o lead assim que o Step3 monta e gera o link limpo com o ID
  const savedRef = useRef(false)
  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true
    async function saveLeadAndBuildLink() {
      setSaving(true)
      const base = APP_URL
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
        console.error('[supabase] insert lead:', error.code, error.message, error.details, error.hint)
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
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 48px', overflowY: 'auto' }}>
      <Petals count={14} />
      <div className="screen-slide-right" style={{ width: '100%', maxWidth: 420, zIndex: 1 }}>
        <StepDots current={3} total={4} />

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: GOLD, textAlign: 'center', marginBottom: 20 }}>
          {sent ? 'Presente enviado! 🎉' : 'Seu cartão está pronto! ✨'}
        </p>

        {/* card preview */}
        <div style={{ background: `linear-gradient(145deg, ${BLUSH}, ${CREAM})`, borderRadius: 20, padding: '24px 20px', marginBottom: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 11, color: ROSE_DARK, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            Dra. Valeria Cabral — Dia das Mães
          </p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: CHARCOAL, marginBottom: 4 }}>
            Para: <em>{data.mae}</em>
          </p>
          {data.de && (
            <p style={{ fontSize: 12, color: ROSE_DARK, marginBottom: 8 }}>Com amor de: {data.de}</p>
          )}
          {data.msg && (
            <p style={{ fontStyle: 'italic', color: '#5a3a32', fontSize: 13, lineHeight: 1.6, borderLeft: `3px solid ${ROSE}`, paddingLeft: 12, marginBottom: 12 }}>
              "{data.msg}"
            </p>
          )}
          <div style={{ background: `linear-gradient(135deg, ${ROSE}, ${ROSE_DARK})`, borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>🎁 Avaliação + Limpeza + Creme de Mão</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>Presente exclusivo Dia das Mães 2025</p>
          </div>
        </div>

        {/* link */}
        {saveErr ? (
          <p style={{ fontSize: 13, color: '#f87171', textAlign: 'center', marginBottom: 14, lineHeight: 1.5 }}>
            Erro ao salvar o cartão. Verifique a conexão e tente novamente.
          </p>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, minHeight: 48 }}>
            {saving || !link ? (
              <p style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                Gerando link seguro...
              </p>
            ) : (
              <>
                <p style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.4)', wordBreak: 'break-all', lineHeight: 1.4 }}>
                  {link}
                </p>
                <button
                  className="cta-btn"
                  onClick={handleCopy}
                  style={{ flexShrink: 0, background: copied ? GOLD : 'rgba(255,255,255,0.1)', color: copied ? CHARCOAL : '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Lato', sans-serif" }}
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
            background: !link || saving ? 'rgba(37,211,102,0.3)' : '#25D366',
            color: '#fff',
            padding: '16px',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 0.5,
            marginBottom: 10,
            boxShadow: !link || saving ? 'none' : '0 4px 20px rgba(37,211,102,0.35)',
            border: 'none',
            cursor: !link || saving ? 'not-allowed' : 'pointer',
            fontFamily: "'Lato', sans-serif",
          }}
        >
          {saving ? 'Preparando...' : `📲 Enviar para ${data.mae} pelo WhatsApp`}
        </button>

        {sent && (
          <p className="screen-enter" style={{ textAlign: 'center', fontSize: 12, color: GOLD, marginBottom: 8, lineHeight: 1.5 }}>
            Link enviado para o WhatsApp da {data.mae}! 🌸
          </p>
        )}

        <BackBtn onClick={onBack} />
      </div>
    </div>
  )
}

/* ─── STEP 3: foto / template ─── */
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
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', overflowY: 'auto' }}>
      <Petals count={10} />
      <div className="screen-slide-right" style={{ width: '100%', maxWidth: 420, zIndex: 1 }}>
        <StepDots current={2} total={4} />

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: CREAM, marginBottom: 4 }}>
          Foto do cartão 📸
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
          Escolha um template ou envie uma foto
        </p>

        {/* preview */}
        <div style={{
          width: '100%', height: 160, borderRadius: 16, marginBottom: 20, overflow: 'hidden',
          background: fotoUrl ? `url(${fotoUrl}) center/cover no-repeat` : selected.bg,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-end',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
          <div style={{ padding: '14px 16px', zIndex: 1 }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4 }}>
              "{selected.phrase}"
            </p>
          </div>
          {fotoUrl && (
            <button onClick={handleRemoveFoto} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: 50, width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          )}
        </div>

        {/* templates */}
        {!fotoUrl && (
          <>
            <p style={{ fontSize: 11, color: ROSE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
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
                    outline: template === t.id ? `3px solid ${ROSE}` : '3px solid transparent',
                    outlineOffset: 2,
                    boxShadow: template === t.id ? `0 0 12px rgba(196,136,122,0.5)` : 'none',
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
        <p style={{ fontSize: 11, color: ROSE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
          {fotoUrl ? 'Foto enviada' : 'Ou enviar uma foto'}
        </p>

        {!fotoUrl ? (
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: 'rgba(255,255,255,0.06)', border: `1px dashed rgba(196,136,122,0.35)`,
            borderRadius: 12, padding: '16px', cursor: 'pointer', marginBottom: 8,
          }}>
            <span style={{ fontSize: 20 }}>{uploading ? '⏳' : '📷'}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: "'Lato', sans-serif" }}>
              {uploading ? 'Enviando...' : 'Toque para escolher foto (máx. 5MB)'}
            </span>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={uploading} />
          </label>
        ) : (
          <button
            onClick={handleRemoveFoto}
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(196,136,122,0.25)`, borderRadius: 12, padding: '12px', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: "'Lato', sans-serif", marginBottom: 8 }}
          >
            🗑 Remover foto e usar template
          </button>
        )}

        {uploadErr && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 8 }}>{uploadErr}</p>}

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

/* ─── ORQUESTRADOR ─── */
export default function FormMode() {
  const [screen, setScreen] = useState('welcome')
  const [data, setData] = useState({ mae: '', de: '', waMae: '', waDe: '', msg: '', template: 'rosa', fotoUrl: null })

  function change(key, val) {
    setData(d => ({ ...d, [key]: val }))
  }

  if (screen === 'welcome')  return <ScreenWelcome onStart={() => setScreen('step1')} />
  if (screen === 'step1')    return <Step1      data={data} onChange={change} onNext={() => setScreen('step2')} onBack={() => setScreen('welcome')} />
  if (screen === 'step2')    return <Step2      msg={data.msg} onMsg={v => change('msg', v)} onNext={() => setScreen('step3foto')} onBack={() => setScreen('step1')} />
  if (screen === 'step3foto') return <Step3Photo template={data.template} fotoUrl={data.fotoUrl} onTemplate={v => change('template', v)} onFoto={v => change('fotoUrl', v)} onNext={() => setScreen('step4')} onBack={() => setScreen('step2')} />
  if (screen === 'step4')    return <Step3      data={data} onBack={() => setScreen('step3foto')} />
}
