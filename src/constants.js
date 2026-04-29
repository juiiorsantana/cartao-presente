export const ROSE      = '#C4887A'
export const ROSE_DARK = '#9E6055'
export const CREAM     = '#FAF5EF'
export const BLUSH     = '#F2E0D8'
export const CHARCOAL  = '#2A2320'
export const GOLD      = '#C9A96E'

export const PHOTO = '/uploads/foto-1777318536248.jpg'

export const APP_URL         = 'https://presente.dravaleriacabral.com.br'
export const WHATSAPP_NUMBER = '5565999629042'

// Link que vai para o WhatsApp — passa pelo /g/:id para servir OG tags
export function shareLink(id) { return `${APP_URL}/g/${id}` }

// Link direto para o app (usado internamente e para copiar)
export function appLink(id)   { return `${APP_URL}/?id=${id}` }
export const WHATSAPP_MSG = 'Olá, Dra. Valeria! Recebi um presente especial de avaliação + limpeza na campanha Dia das Mães. Gostaria de agendar minha consulta. 🌸'

export const PETALS = ['🌸', '🌺', '✿', '❀', '🌼']
