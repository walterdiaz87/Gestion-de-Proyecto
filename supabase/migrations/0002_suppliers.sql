-- Add suppliers table
create table public.suppliers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  contact_person text,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.suppliers enable row level security;

-- Policies (staff only)
create policy "Suppliers viewable by staff"
  on public.suppliers for select
  using ( is_admin() or get_my_role() = 'responsable' );

create policy "Suppliers editable by staff"
  on public.suppliers for all
  using ( is_admin() or get_my_role() = 'responsable' );

-- Add supplier_id to quotes and purchase_orders for better tracking
alter table public.quotes add column supplier_id uuid references public.suppliers(id) on delete set null;
alter table public.purchase_orders add column supplier_id uuid references public.suppliers(id) on delete set null;
