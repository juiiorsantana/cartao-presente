import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const APP_URL   = 'https://presente.dravaleriacabral.com.br'
const IMG_URL   = `${APP_URL}/og-image.jpg`

const BOT_AGENTS = [
  'whatsapp', 'facebookexternalhit', 'facebot',
  'twitterbot', 'telegrambot', 'linkedinbot',
  'slackbot', 'discordbot', 'googlebot', 'bingbot',
]

function isBot(ua = '') {
  const u = ua.toLowerCase()
  return BOT_AGENTS.some(b => u.includes(b))
}

function ogHtml({ title, description, redirectUrl }) {
  const esc = s => s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>${esc(title)}</title>
  <meta property="og:type"        content="website"/>
  <meta property="og:url"         content="${esc(redirectUrl)}"/>
  <meta property="og:title"       content="${esc(title)}"/>
  <meta property="og:description" content="${esc(description)}"/>
  <meta property="og:image"       content="${IMG_URL}"/>
  <meta property="og:image:width"  content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:locale"      content="pt_BR"/>
  <meta property="og:site_name"   content="Dra. Valeria Cabral"/>
  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:title"       content="${esc(title)}"/>
  <meta name="twitter:description" content="${esc(description)}"/>
  <meta name="twitter:image"       content="${IMG_URL}"/>
  <meta http-equiv="refresh" content="0;url=${esc(redirectUrl)}"/>
</head>
<body>
  <a href="${esc(redirectUrl)}">Abrir presente 🎁</a>
</body>
</html>`
}

export default async function handler(req, res) {
  const id = req.query.id

  if (!id) {
    return res.redirect(302, APP_URL)
  }

  const appUrl = `${APP_URL}/?id=${id}`
  const ua = req.headers['user-agent'] || ''

  // Humanos vão direto para o app
  if (!isBot(ua)) {
    return res.redirect(302, appUrl)
  }

  // Bots: busca dados e retorna OG HTML
  const { data: lead } = await supabase
    .from('leads')
    .select('mae, de')
    .eq('id', id)
    .single()

  let title, description

  if (lead) {
    title = lead.de
      ? `${lead.mae}, você ganhou um presente de ${lead.de}! 🎁`
      : `${lead.mae}, você tem um presente especial! 🎁`

    description = lead.de
      ? `${lead.de} preparou algo muito especial para você: uma avaliação dental + limpeza profissional com a Dra. Valeria Cabral. Toque para abrir! 🌸`
      : 'Alguém especial preparou uma surpresa para você com a Dra. Valeria Cabral. Toque para abrir! 🌸'
  } else {
    title       = 'Você tem um presente especial! 🎁'
    description = 'Abra para ver sua surpresa da Dra. Valeria Cabral. 🌸'
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  res.send(ogHtml({ title, description, redirectUrl: appUrl }))
}
