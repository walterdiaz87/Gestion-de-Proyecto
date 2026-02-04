-- Fix RLS policies for tasks to allow creation

-- Drop existing problematic policies
drop policy if exists "Tasks editable by supervisor or assigned responsable" on public.tasks;
drop policy if exists "Tasks creatable by staff" on public.tasks;

-- Recreate with proper permissions
create policy "Tasks insertable by staff"
  on public.tasks for insert
  with check ( is_admin() or get_my_role() = 'responsable' );

create policy "Tasks updatable by staff"
  on public.tasks for update
  using ( is_admin() or get_my_role() = 'responsable' or responsable_id = auth.uid() );

create policy "Tasks deletable by admin"
  on public.tasks for delete
  using ( is_admin() );
