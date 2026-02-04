-- Complete fix for task RLS policies

-- Drop ALL existing task policies
drop policy if exists "Tasks viewable by staff" on public.tasks;
drop policy if exists "Tasks creatable by staff" on public.tasks;
drop policy if exists "Tasks editable by supervisor or assigned responsable" on public.tasks;
drop policy if exists "Tasks insertable by staff" on public.tasks;
drop policy if exists "Tasks updatable by staff" on public.tasks;
drop policy if exists "Tasks deletable by admin" on public.tasks;

-- Create simple, permissive policies
create policy "Enable read access for staff"
  on public.tasks for select
  using ( is_admin() or get_my_role() in ('responsable', 'operario') );

create policy "Enable insert for staff"
  on public.tasks for insert
  with check ( is_admin() or get_my_role() = 'responsable' );

create policy "Enable update for staff"
  on public.tasks for update
  using ( is_admin() or get_my_role() = 'responsable' );

create policy "Enable delete for admin"
  on public.tasks for delete
  using ( is_admin() );
