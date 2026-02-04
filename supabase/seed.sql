-- Seed Data with Auth Users
-- Note: Manually inserting into auth.users is for SEEDING/DEMO PURPOSES ONLY.

-- 0. Cleanup (Optional, careful in prod)
-- delete from public.profiles where id in ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', ...);
-- delete from auth.users where id in ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', ...);

-- 1. Create Auth Users
insert into auth.users (id, aud, role, email, email_confirmed_at, recovery_sent_at, last_sign_in_at, created_at, updated_at)
values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'authenticated', 'authenticated', 'supervisor@demo.com', now(), now(), now(), now(), now()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'authenticated', 'authenticated', 'resp1@demo.com', now(), now(), now(), now(), now()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'authenticated', 'authenticated', 'resp2@demo.com', now(), now(), now(), now(), now()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'authenticated', 'authenticated', 'resp3@demo.com', now(), now(), now(), now(), now()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'authenticated', 'authenticated', 'op1@demo.com', now(), now(), now(), now(), now()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'authenticated', 'authenticated', 'op2@demo.com', now(), now(), now(), now(), now()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'authenticated', 'authenticated', 'op3@demo.com', now(), now(), now(), now(), now()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'authenticated', 'authenticated', 'op4@demo.com', now(), now(), now(), now(), now()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05', 'authenticated', 'authenticated', 'op5@demo.com', now(), now(), now(), now(), now()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c06', 'authenticated', 'authenticated', 'op6@demo.com', now(), now(), now(), now(), now()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c07', 'authenticated', 'authenticated', 'op7@demo.com', now(), now(), now(), now(), now()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c08', 'authenticated', 'authenticated', 'op8@demo.com', now(), now(), now(), now(), now())
on conflict (id) do nothing; -- Skip if already exists

-- 2. Profiles
insert into public.profiles (id, email, full_name, role) values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'supervisor@demo.com', 'Carlos Supervisor', 'supervisor'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'resp1@demo.com', 'Ana Responsable Civil', 'responsable'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'resp2@demo.com', 'Juan Responsable Estructura', 'responsable'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'resp3@demo.com', 'Maria Responsable Elec', 'responsable'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'op1@demo.com', 'Pedro Operario', 'operario'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'op2@demo.com', 'Luis Operario', 'operario'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'op3@demo.com', 'Jose Operario', 'operario'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'op4@demo.com', 'Miguel Operario', 'operario'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05', 'op5@demo.com', 'Jorge Operario', 'operario'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c06', 'op6@demo.com', 'Ramon Operario', 'operario'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c07', 'op7@demo.com', 'Andres Operario', 'operario'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c08', 'op8@demo.com', 'Lucas Operario', 'operario')
on conflict (id) do nothing;

-- 3. Project
insert into public.projects (id, name, description, start_date, end_date, status) values
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Ampliación Nave Industrial B', 'Proyecto de ampliación de planta 2000m2 incluyendo civil, metálica e instalaciones.', '2024-03-01', '2024-09-30', 'active')
on conflict (id) do nothing;

-- 4. Tasks
-- Civil (Resp 1)
insert into public.tasks (id, project_id, name, responsable_id, start_date, end_date, status, position) values
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Movimiento de Suelos', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', '2024-03-01', '2024-03-15', 'done', 1),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Fundaciones', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', '2024-03-16', '2024-04-10', 'in_progress', 2)
on conflict (id) do nothing;

-- Estructura (Resp 2)
insert into public.tasks (id, project_id, name, responsable_id, start_date, end_date, status, position) values
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Fabricación Estructura', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-03-10', '2024-05-01', 'blocked', 3), -- Blocked example
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Montaje Estructura', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-05-02', '2024-06-01', 'pending', 4)
on conflict (id) do nothing;

-- Elec (Resp 3)
insert into public.tasks (id, project_id, name, responsable_id, start_date, end_date, status, position) values
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Tableros Principales', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', '2024-06-01', '2024-06-20', 'pending', 5)
on conflict (id) do nothing;

-- 5. Subtasks
-- Movimiento de suelos (Done)
insert into public.subtasks (task_id, title, type, status, assigned_to) values
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'Replanteo', 'diseno', 'done', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'Excavación masiva', 'ejecucion', 'done', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'Compactación', 'control', 'done', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02');

-- Fundaciones (In Progress)
insert into public.subtasks (task_id, title, type, status, assigned_to) values
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'Armado de hierros', 'ejecucion', 'done', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'Encofrado', 'ejecucion', 'in_progress', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'Colado de hormigón', 'ejecucion', 'pending', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05');

-- Fabricación Estructura (Blocked by materials)
insert into public.subtasks (task_id, title, type, status, is_blocking) values
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'Ingeniería de detalle', 'diseno', 'done', false),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'Compra de perfiles', 'compra', 'pending', true), -- Blocking subtask
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'Corte y soldado', 'ejecucion', 'pending', false);

-- 6. Materials & Purchasing
-- Material for Estructura
insert into public.materials (id, task_id, name, unit, quantity_required, status) values
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'Perfil IPN 200', 'kg', 5000, 'partial')
on conflict (id) do nothing;

-- Quotes
insert into public.quotes (material_id, supplier_name, price, currency, is_selected) values
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 'Acindar', 1.25, 'USD', true),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 'Gennaro', 1.30, 'USD', false);

-- PO
insert into public.purchase_orders (id, supplier_name, order_number, status, expected_delivery_date) values
  ('70eebc99-9c0b-4ef8-bb6d-6bb9bd380701', 'Acindar', 'OC-2024-001', 'sent', '2024-03-20')
on conflict (id) do nothing;

-- Link Quote to PO
update public.quotes set purchase_order_id = '70eebc99-9c0b-4ef8-bb6d-6bb9bd380701' where is_selected = true;

-- Delivery (Partial)
insert into public.deliveries (id, purchase_order_id, receipt_number, delivery_date) values
  ('80eebc99-9c0b-4ef8-bb6d-6bb9bd380801', '70eebc99-9c0b-4ef8-bb6d-6bb9bd380701', 'R-00552', '2024-03-18')
on conflict (id) do nothing;

insert into public.delivery_items (delivery_id, material_id, quantity) values
  ('80eebc99-9c0b-4ef8-bb6d-6bb9bd380801', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 2500); -- 50% delivered

-- Update material status
update public.materials set quantity_received = 2500, status = 'partial' where id = 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01';
