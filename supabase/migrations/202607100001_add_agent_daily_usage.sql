create table if not exists public.agent_daily_usage (
  agent_id text not null,
  usage_date date not null,
  request_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (agent_id, usage_date)
);

drop trigger if exists set_agent_daily_usage_updated_at on public.agent_daily_usage;
create trigger set_agent_daily_usage_updated_at
before update on public.agent_daily_usage
for each row execute function public.set_updated_at();

alter table public.agent_daily_usage enable row level security;

drop policy if exists "No public agent usage reads" on public.agent_daily_usage;
create policy "No public agent usage reads" on public.agent_daily_usage
for select using (false);

create or replace function public.consume_agent_daily_limit(
  p_agent_id text,
  p_usage_date date,
  p_max_requests integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  next_count integer;
begin
  insert into public.agent_daily_usage (agent_id, usage_date, request_count)
  values (p_agent_id, p_usage_date, 1)
  on conflict (agent_id, usage_date)
  do update
    set request_count = public.agent_daily_usage.request_count + 1
    where public.agent_daily_usage.request_count < p_max_requests
  returning request_count into next_count;

  return next_count is not null;
end;
$$;
