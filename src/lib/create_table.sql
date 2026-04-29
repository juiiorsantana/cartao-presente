create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  mae           text not null,
  wa_mae        text not null,
  de            text,
  wa_de         text,
  msg           text,
  link          text,
  enviado_at    timestamptz default now(),
  visualizado_at timestamptz
);

-- Permite leitura/escrita pública (RLS desabilitado para campanha simples)
alter table leads disable row level security;
