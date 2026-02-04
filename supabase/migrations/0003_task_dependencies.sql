-- Add hierarchical task structure and dependencies

-- Add parent_task_id for task hierarchy
alter table public.tasks add column parent_task_id uuid references public.tasks(id) on delete cascade;
alter table public.tasks add column wbs_code text; -- Work Breakdown Structure code (e.g., "1.2.3")
alter table public.tasks add column task_order integer default 0; -- Order within parent
alter table public.tasks add column is_milestone boolean default false;
alter table public.tasks add column duration_days integer; -- Calculated or manual

-- Task Dependencies table
create type public.dependency_type as enum ('FS', 'SS', 'FF', 'SF');
-- FS = Finish-to-Start (default)
-- SS = Start-to-Start
-- FF = Finish-to-Finish
-- SF = Start-to-Finish

create table public.task_dependencies (
  id uuid default uuid_generate_v4() primary key,
  predecessor_task_id uuid references public.tasks(id) on delete cascade not null,
  successor_task_id uuid references public.tasks(id) on delete cascade not null,
  dependency_type public.dependency_type default 'FS',
  lag_days integer default 0, -- Positive = delay, Negative = lead time
  created_at timestamptz default now(),
  
  -- Prevent circular dependencies and self-references
  constraint different_tasks check (predecessor_task_id != successor_task_id),
  constraint unique_dependency unique (predecessor_task_id, successor_task_id)
);

-- Enable RLS
alter table public.task_dependencies enable row level security;

-- Policies (same as tasks)
create policy "Dependencies viewable by staff"
  on public.task_dependencies for select
  using ( is_admin() or get_my_role() = 'responsable' );

create policy "Dependencies editable by staff"
  on public.task_dependencies for all
  using ( is_admin() or get_my_role() = 'responsable' );

-- Function to calculate task level (depth in hierarchy)
create or replace function public.get_task_level(task_id uuid)
returns integer as $$
declare
  level_count integer := 0;
  current_parent uuid;
begin
  current_parent := (select parent_task_id from public.tasks where id = task_id);
  
  while current_parent is not null loop
    level_count := level_count + 1;
    current_parent := (select parent_task_id from public.tasks where id = current_parent);
    
    -- Prevent infinite loops
    if level_count > 10 then
      exit;
    end if;
  end loop;
  
  return level_count;
end;
$$ language plpgsql stable;

-- Index for performance
create index idx_tasks_parent on public.tasks(parent_task_id);
create index idx_task_deps_predecessor on public.task_dependencies(predecessor_task_id);
create index idx_task_deps_successor on public.task_dependencies(successor_task_id);
