-- Extensions
create extension if not exists "uuid-ossp";

-- ROLES & PROFILES
create type public.user_role as enum ('supervisor', 'responsable', 'operario', 'contratista');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role public.user_role default 'operario',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROJECTS
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  start_date date,
  end_date date,
  status text default 'active',
  created_at timestamptz default now()
);

-- TASKS (Gantt)
create type public.task_status as enum ('pending', 'in_progress', 'blocked', 'done');

create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  responsable_id uuid references public.profiles(id), -- The 'Responsable' user
  start_date date,
  end_date date,
  status public.task_status default 'pending',
  is_blocked boolean default false,
  position integer,
  created_at timestamptz default now()
);

-- SUBTASKS (Workflow)
create type public.subtask_type as enum ('revision', 'diseno', 'compra', 'espera', 'ejecucion', 'control');
create type public.subtask_status as enum ('pending', 'in_progress', 'done');

create table public.subtasks (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  title text not null,
  assigned_to uuid references public.profiles(id), -- Can be operario
  type public.subtask_type not null,
  status public.subtask_status default 'pending',
  is_blocking boolean default false,
  start_date date,
  end_date date,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- MATERIALS
create type public.material_status as enum ('needed', 'quoted', 'ordered', 'partial', 'received');

create table public.materials (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  name text not null,
  unit text not null, 
  quantity_required numeric not null,
  quantity_received numeric default 0,
  status public.material_status default 'needed',
  created_at timestamptz default now()
);

-- PURCHASE ORDERS
create type public.po_status as enum ('draft', 'sent', 'received');

create table public.purchase_orders (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id), -- Optional link to project
  supplier_name text not null,
  order_number text, -- manually entered or generated
  status public.po_status default 'draft',
  expected_delivery_date date,
  created_at timestamptz default now()
);

-- QUOTES
create table public.quotes (
  id uuid default uuid_generate_v4() primary key,
  material_id uuid references public.materials(id) on delete cascade not null,
  supplier_name text not null,
  price numeric not null,
  currency text default 'USD',
  is_selected boolean default false,
  purchase_order_id uuid references public.purchase_orders(id) on delete set null,
  created_at timestamptz default now()
);

-- DELIVERIES
create table public.deliveries (
  id uuid default uuid_generate_v4() primary key,
  purchase_order_id uuid references public.purchase_orders(id) on delete cascade,
  receipt_number text,
  delivery_date date default now(),
  created_at timestamptz default now()
);

create table public.delivery_items (
  id uuid default uuid_generate_v4() primary key,
  delivery_id uuid references public.deliveries(id) on delete cascade not null,
  material_id uuid references public.materials(id) on delete cascade not null,
  quantity numeric not null
);

-- TIMESHEETS
create table public.timesheets (
  id uuid default uuid_generate_v4() primary key,
  subtask_id uuid references public.subtasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  hours numeric not null,
  notes text,
  created_at timestamptz default now()
);

-- Enable Realtime for key tables
alter publication supabase_realtime add table tasks, subtasks, materials;
