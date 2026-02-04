-- Add fields for task completion and notes

alter table public.tasks add column completed_at timestamptz;
alter table public.tasks add column notes text;

-- Add index for querying overdue tasks
create index idx_tasks_end_date on public.tasks(end_date);
create index idx_tasks_status on public.tasks(status);
