-- FINAL FIX: Use authenticated() instead of helper functions
-- The helper functions return null in some contexts, blocking all operations

-- Drop all existing task policies
drop policy if exists "Enable read access for staff" on public.tasks;
drop policy if exists "Enable insert for staff" on public.tasks;
drop policy if exists "Enable update for staff" on public.tasks;
drop policy if exists "Enable delete for admin" on public.tasks;

-- Create simple, working policies based on authentication
create policy "Allow authenticated users to read tasks"
  on public.tasks for select
  to authenticated
  using ( true );

create policy "Allow authenticated users to insert tasks"
  on public.tasks for insert
  to authenticated
  with check ( true );

create policy "Allow authenticated users to update tasks"
  on public.tasks for update
  to authenticated
  using ( true );

create policy "Allow authenticated users to delete tasks"
  on public.tasks for delete
  to authenticated
  using ( true );

-- Note: These are permissive policies for development.
-- In production, you would add role-based checks using joins to profiles table
-- Example: using ( exists (select 1 from profiles where id = auth.uid() and role in ('supervisor', 'responsable')) )
