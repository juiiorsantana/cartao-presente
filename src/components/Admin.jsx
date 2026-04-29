import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = 'valeria2025'

/* ── paleta light ── */
const C = {
  bg:       '#F7F5F3',
  surface:  '#FFFFFF',
  border:   '#E8E2DC',
  rose:     '#C4887A',
  roseDark: '#9E6055',
  gold:     '#C9A96E',
  text:     '#2A2320',
  muted:    '#8A7672',
  green:    '#2D9E6A',
  greenBg:  '#EDFAF4',
  amber:    '#B07830',
  amberBg:  '#FEF6E8',
  sidebar:  '#2A2320',
}

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function waLink(raw) {
  if (!raw) return null
  return `https://wa.me/55${raw.replace(/\D/g, '')}`
}

/* ── Login ── */
function LoginScreen({ onLogin }) {
  const [pw, setPw]   = useState('')
  const [err, setErr] = useState(false)

  function handle(e) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) { onLogin(); return }
    setErr(true)
    setTimeout(() => setErr(false), 1800)
  }

  return (
    <div style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 360, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: C.rose, margin: '0 auto 14px' }}></div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.text, marginBottom: 4 }}>Área Administrativa</h1>
          <p style={{ fontSize: 13, color: C.muted }}>Dra. Valeria Cabral</p>
        </div>

        <form onSubmit={handle}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
            Senha
          </label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="••••••••"
            autoFocus
            style={{
              width: '100%', background: C.surface, color: C.text,
              padding: '12px 14px', borderRadius: 10, fontSize: 15,
              border: `1.5px solid ${err ? '#f87171' : C.border}`,
              fontFamily: "'Lato', sans-serif", outline: 'none', marginBottom: 8,
              boxSizing: 'border-box',
            }}
          />
          {err && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>Senha incorreta</p>}
          <button type="submit" style={{
            width: '100%', background: C.rose, color: '#fff', border: 'none',
            borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Lato', sans-serif", marginTop: 4,
          }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── Stat card ── */
function StatCard({ label, value, icon, accent }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', flex: 1, minWidth: 120 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      <p style={{ fontSize: 30, fontWeight: 700, color: accent || C.text, lineHeight: 1 }}>{value}</p>
    </div>
  )
}

/* ── Badge ── */
function Badge({ viewed }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: viewed ? C.greenBg : C.amberBg,
      color: viewed ? C.green : C.amber,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: viewed ? C.green : C.amber, display: 'inline-block' }} />
      {viewed ? 'Abriu' : 'Aguardando'}
    </span>
  )
}

/* ── Linha da tabela ── */
function LeadRow({ lead, onCopyLink, onDelete, isLast }) {
  const [expanded, setExpanded]   = useState(false)
  const [confirm, setConfirm]     = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const viewed = !!lead.visualizado_at

  async function handleDelete(e) {
    e.stopPropagation()
    if (!confirm) { setConfirm(true); return }
    if (!lead.id) return
    setDeleting(true)
    if (lead.foto_url) {
      const path = lead.foto_url.split('/fotos/')[1]
      if (path) await supabase.storage.from('fotos').remove([path])
    }
    const { error } = await supabase.from('leads').delete().eq('id', lead.id)
    if (error) { console.error('[delete lead]', error.message); setDeleting(false); return }
    onDelete(lead.id)
  }

  return (
    <>
      <tr
        onClick={() => setExpanded(e => !e)}
        style={{ cursor: 'pointer', background: expanded ? '#FBF9F8' : C.surface, transition: 'background 0.15s' }}
      >
        <td style={{ padding: '14px 16px', borderBottom: isLast && !expanded ? 'none' : `1px solid ${C.border}` }}>
          <p style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{lead.mae}</p>
          {lead.de && <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>De: {lead.de}</p>}
        </td>
        <td style={{ padding: '14px 16px', borderBottom: isLast && !expanded ? 'none' : `1px solid ${C.border}` }}>
          {lead.wa_mae
            ? <a href={waLink(lead.wa_mae)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: C.rose, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                {lead.wa_mae}
              </a>
            : <span style={{ color: C.muted, fontSize: 13 }}>—</span>}
        </td>
        <td style={{ padding: '14px 16px', borderBottom: isLast && !expanded ? 'none' : `1px solid ${C.border}` }}>
          <Badge viewed={viewed} />
        </td>
        <td style={{ padding: '14px 16px', borderBottom: isLast && !expanded ? 'none' : `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>
          {fmtDate(lead.enviado_at)}
        </td>
        <td style={{ padding: '14px 16px', borderBottom: isLast && !expanded ? 'none' : `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>
          {viewed ? fmtDate(lead.visualizado_at) : '—'}
        </td>
        <td style={{ padding: '14px 16px', borderBottom: isLast && !expanded ? 'none' : `1px solid ${C.border}`, textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: confirm ? '#FEE2E2' : 'transparent',
                border: `1px solid ${confirm ? '#FCA5A5' : C.border}`,
                color: confirm ? '#DC2626' : C.muted,
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Lato', sans-serif", transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {deleting ? '...' : confirm ? 'Confirmar' : '🗑'}
            </button>
            {confirm && (
              <button
                onClick={e => { e.stopPropagation(); setConfirm(false) }}
                style={{ background: 'transparent', border: 'none', color: C.muted, fontSize: 11, cursor: 'pointer', fontFamily: "'Lato', sans-serif" }}
              >
                Cancelar
              </button>
            )}
            <span style={{ color: C.muted, fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr style={{ background: '#FBF9F8' }}>
          <td colSpan={6} style={{ padding: '0 16px 16px', borderBottom: isLast ? 'none' : `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>

              {lead.msg && (
                <div style={{ flex: 2, minWidth: 200, background: '#FFF8F5', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.rose, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Mensagem</p>
                  <p style={{ fontSize: 13, color: C.text, fontStyle: 'italic', lineHeight: 1.6 }}>"{lead.msg}"</p>
                </div>
              )}

              <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lead.wa_de && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>WhatsApp de quem deu</p>
                    <a href={waLink(lead.wa_de)} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.rose, fontWeight: 600, textDecoration: 'none' }}>
                      {lead.wa_de}
                    </a>
                  </div>
                )}
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Enviado em</p>
                  <p style={{ fontSize: 13, color: C.text }}>{fmt(lead.enviado_at)}</p>
                </div>
                {lead.visualizado_at && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Abriu em</p>
                    <p style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>{fmt(lead.visualizado_at)}</p>
                  </div>
                )}
              </div>

              {lead.link && (
                <button
                  onClick={() => onCopyLink(lead.link)}
                  style={{ alignSelf: 'flex-end', background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: '8px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: "'Lato', sans-serif", fontWeight: 600 }}
                >
                  🔗 Copiar link
                </button>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

/* ── Dashboard ── */
function Dashboard({ onLogout }) {
  const [leads, setLeads]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('todos')
  const [toast, setToast]     = useState('')

  useEffect(() => {
    fetchLeads()
    const t = setInterval(fetchLeads, 30000)
    window.addEventListener('focus', fetchLeads)
    return () => { clearInterval(t); window.removeEventListener('focus', fetchLeads) }
  }, [])

  async function fetchLeads() {
    const { data, error } = await supabase.from('leads').select('*').order('enviado_at', { ascending: false })
    console.log('[fetchLeads]', { count: data?.length, error: error?.message })
    if (error) { setLoading(false); return }
    if (data && data.length > 0) setLeads(data)
    setLoading(false)
  }

  function copyLink(link) {
    navigator.clipboard.writeText(link).then(() => {
      setToast('Link copiado!')
      setTimeout(() => setToast(''), 2200)
    })
  }

  function deleteLead(id) {
    setLeads(l => l.filter(x => x.id !== id))
    setToast('Lead apagado.')
    setTimeout(() => setToast(''), 2200)
  }

  const filtered = useMemo(() => {
    let list = leads
    if (filter === 'abriu')      list = list.filter(l => l.visualizado_at)
    if (filter === 'aguardando') list = list.filter(l => !l.visualizado_at)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(l =>
        l.mae?.toLowerCase().includes(q)  ||
        l.de?.toLowerCase().includes(q)   ||
        l.wa_mae?.includes(q)             ||
        l.msg?.toLowerCase().includes(q)
      )
    }
    return list
  }, [leads, filter, search])

  const total   = leads.length
  const abriu   = leads.filter(l => l.visualizado_at).length
  const aguard  = total - abriu
  const taxa    = total ? Math.round((abriu / total) * 100) : 0

  return (
    <div style={{ width: '100%', minHeight: '100%', background: C.bg, fontFamily: "'Lato', sans-serif", overflowY: 'auto' }}>

      {/* topbar */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.rose }}></div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1 }}>Dra. Valeria Cabral</p>
            <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.3 }}>Gestão de Leads · Dia das Mães</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {toast && <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>✓ {toast}</span>}
          <button onClick={fetchLeads} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: "'Lato', sans-serif" }}>
            ↻
          </button>
          <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 12, fontFamily: "'Lato', sans-serif" }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>

        {/* stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard label="Total" value={total} icon="🎁" />
          <StatCard label="Abriram" value={`${abriu} · ${taxa}%`} icon="✅" accent={C.green} />
          <StatCard label="Aguardando" value={aguard} icon="⏳" accent={C.amber} />
        </div>

        {/* toolbar */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Buscar por nome, WhatsApp ou mensagem..."
            style={{
              flex: 1, minWidth: 200, background: C.bg, color: C.text,
              padding: '9px 12px', borderRadius: 8, fontSize: 13,
              border: `1px solid ${C.border}`, fontFamily: "'Lato', sans-serif", outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            {[['todos', 'Todos'], ['abriu', 'Abriram'], ['aguardando', 'Aguardando']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: '8px 14px', borderRadius: 8, border: `1px solid ${filter === key ? C.rose : C.border}`,
                  background: filter === key ? '#FFF0EE' : 'transparent',
                  color: filter === key ? C.rose : C.muted,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'Lato', sans-serif", transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* tabela */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: C.muted, padding: '40px 0', fontSize: 14 }}>Carregando...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>

              <p style={{ color: C.muted, fontSize: 14 }}>
                {search || filter !== 'todos' ? 'Nenhum resultado encontrado.' : 'Nenhum cartão gerado ainda.'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {['Mamãe', 'WhatsApp', 'Status', 'Enviado', 'Abriu', ''].map((h, i) => (
                    <th key={i} style={{ padding: '10px 16px', textAlign: i === 5 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase', borderBottom: `1px solid ${C.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <LeadRow key={lead.id} lead={lead} onCopyLink={copyLink} onDelete={deleteLead} isLast={i === filtered.length - 1} />
                ))}
              </tbody>
            </table>
          )}

          {filtered.length > 0 && (
            <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 12, color: C.muted }}>{filtered.length} {filtered.length === 1 ? 'lead' : 'leads'}</p>
              <p style={{ fontSize: 11, color: C.muted }}>Atualiza a cada 30s</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Orquestrador ── */
export default function Admin() {
  const [auth, setAuth] = useState(() => sessionStorage.getItem('admin_auth') === '1')

  useEffect(() => {
    const els = [document.documentElement, document.body, document.getElementById('root')]
    els.forEach(el => { if (el) el.style.overflow = 'auto' })
    return () => els.forEach(el => { if (el) el.style.overflow = '' })
  }, [])

  function handleLogin() {
    sessionStorage.setItem('admin_auth', '1')
    setAuth(true)
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_auth')
    setAuth(false)
  }

  if (!auth) return <LoginScreen onLogin={handleLogin} />
  return <Dashboard onLogout={handleLogout} />
}
