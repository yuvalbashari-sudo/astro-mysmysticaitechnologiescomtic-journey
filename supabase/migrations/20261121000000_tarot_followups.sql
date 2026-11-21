-- Only Edge Functions may access a member's reading context and answer.
create table public.tarot_followups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  guest_key_hash text,
  check ((user_id is null) <> (guest_key_hash is null)),
  spread jsonb not null,
  question text,
  answer text,
  claim uuid,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.tarot_followups enable row level security;
revoke all on public.tarot_followups from public, anon, authenticated;
grant select, insert, update, delete on public.tarot_followups to service_role;
