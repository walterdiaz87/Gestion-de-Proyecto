-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.materials enable row level security;
alter table public.quotes enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.deliveries enable row level security;
alter table public.timesheets enable row level security;

-- Helper Functions
create or replace function public.get_my_role()
returns public.user_role as $$
  select role from public.profiles where id = auth.uid()
$$ language sql stable security definer;

create or replace function public.is_admin()
returns boolean as $$
  select (get_my_role() = 'supervisor')
$$ language sql stable;

-- PROFILES
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- PROJECTS
-- Supervisor sees all, Responsable sees all (simple approach to allow collaboration), Operario sees nothing (only subtasks)
create policy "Projects viewable by staff"
  on public.projects for select
  using ( is_admin() or get_my_role() = 'responsable' );

create policy "Projects editable by supervisor"
  on public.projects for all
  using ( is_admin() );

-- TASKS
-- Supervisor/Responsable see all in projects they can see.
create policy "Tasks viewable by staff"
  on public.tasks for select
  using ( is_admin() or get_my_role() = 'responsable' );

create policy "Tasks editable by supervisor or assigned responsable"
  on public.tasks for all
  using ( is_admin() or (get_my_role() = 'responsable' and responsable_id = auth.uid()) );
  
-- Also allow Responsable to create tasks? Yes.
create policy "Tasks creatable by staff"
  on public.tasks for insert
  with check ( is_admin() or get_my_role() = 'responsable' );


-- SUBTASKS
-- Supervisor/Responsable see all. Operario sees assigned to them.
create policy "Subtasks viewable by staff and assignee"
  on public.subtasks for select
  using ( 
    is_admin() 
    or get_my_role() = 'responsable' 
    or assigned_to = auth.uid() 
  );

create policy "Subtasks editable by supervisor or assigned responsable"
  on public.subtasks for update
  using ( is_admin() or get_my_role() = 'responsable' );
  -- Note: Operarios might need to update status? Yes.
  
create policy "Subtasks updateable by assignee"
  on public.subtasks for update
  using ( assigned_to = auth.uid() )
  with check ( assigned_to = auth.uid() ); 
  -- Maybe restrict columns? For now allow full update for simplicity, or we can use triggers to protect critical fields.

-- MATERIALS / QUOTES / POS
-- Visible to staff (Supervisor/Responsable)
create policy "Purchasing info viewable by staff"
  on public.materials for select using ( is_admin() or get_my_role() = 'responsable' );
create policy "Purchasing info editable by staff"
  on public.materials for all using ( is_admin() or get_my_role() = 'responsable' );

create policy "Quotes viewable by staff"
  on public.quotes for select using ( is_admin() or get_my_role() = 'responsable' );
create policy "Quotes editable by staff"
  on public.quotes for all using ( is_admin() or get_my_role() = 'responsable' );

create policy "POs viewable by staff"
  on public.purchase_orders for select using ( is_admin() or get_my_role() = 'responsable' );
create policy "POs editable by staff"
  on public.purchase_orders for all using ( is_admin() or get_my_role() = 'responsable' );

create policy "Deliveries viewable by staff"
  on public.deliveries for select using ( is_admin() or get_my_role() = 'responsable' );
create policy "Deliveries editable by staff"
  on public.deliveries for all using ( is_admin() or get_my_role() = 'responsable' );

-- TIMESHEETS
-- Viewable by staff. Operario sees own.
create policy "Timesheets viewable by admin or owner"
  on public.timesheets for select
  using ( is_admin() or get_my_role() = 'responsable' or user_id = auth.uid() );

create policy "Timesheets insertable by owner"
  on public.timesheets for insert
  with check ( user_id = auth.uid() );

create policy "Timesheets editable by owner"
  on public.timesheets for update
  using ( user_id = auth.uid() );

