-- Supabase SQL Editor 에서 한 번 실행
create table if not exists events (
  id bigint generated always as identity primary key,
  visitor_id text not null,
  session_id text,
  stage smallint,
  turn smallint,
  kind text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists events_created_idx on events (created_at desc);
create index if not exists events_session_idx on events (session_id);
alter table events enable row level security; -- 정책 없음 = anon 접근 불가, 서버(service role)만 사용
-- 30일 보유 정책(개인정보 고지와 일치): pg_cron 사용 시
-- select cron.schedule('purge-events','0 3 * * *',$$delete from events where created_at < now()-interval '30 days'$$);
