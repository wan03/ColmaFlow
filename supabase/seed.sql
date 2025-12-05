-- Clean up existing data (order matters for FKs)
truncate table balance_history cascade;
truncate table store_customer_relationships cascade;
truncate table orders cascade;
truncate table store_products cascade;
truncate table global_products cascade;
truncate table colmados cascade;
truncate table profiles cascade;
-- We don't truncate auth.users usually, but for a clean seed we might need specific IDs.
-- For safety in this environment, I'll delete only the users I'm about to insert if they exist, or just insert on conflict do nothing.

-- 1. Create Users in auth.users
-- Using hardcoded UUIDs for consistency

-- Owner: Juan El Colmadero
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
  ('d0d8c19c-0b0d-4096-b0a6-123456789001', 'authenticated', 'authenticated', 'juan@colmado.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('d0d8c19c-0b0d-4096-b0a6-123456789002', 'authenticated', 'authenticated', 'maria@colmado.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('d0d8c19c-0b0d-4096-b0a6-123456789003', 'authenticated', 'authenticated', 'pedro@cliente.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('d0d8c19c-0b0d-4096-b0a6-123456789004', 'authenticated', 'authenticated', 'luisa@cliente.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('d0d8c19c-0b0d-4096-b0a6-123456789005', 'authenticated', 'authenticated', 'carlos@driver.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- 2. Profiles
INSERT INTO public.profiles (id, role, phone, full_name)
VALUES
  ('d0d8c19c-0b0d-4096-b0a6-123456789001', 'owner', '809-555-0101', 'Juan El Colmadero'),
  ('d0d8c19c-0b0d-4096-b0a6-123456789002', 'owner', '829-555-0202', 'Maria La Dura'),
  ('d0d8c19c-0b0d-4096-b0a6-123456789003', 'customer', '849-555-0303', 'Pedro Cliente'),
  ('d0d8c19c-0b0d-4096-b0a6-123456789004', 'customer', '809-555-0404', 'Luisa Compra'),
  ('d0d8c19c-0b0d-4096-b0a6-123456789005', 'driver', '829-555-0505', 'Carlos Chofer');

-- 3. Colmados
-- Coordinates around Santo Domingo
INSERT INTO public.colmados (id, owner_id, name, location, is_open)
VALUES
  (
    'c01m4d0s-0001-4000-8000-000000000001',
    'd0d8c19c-0b0d-4096-b0a6-123456789001',
    'Súper Colmado La Bendición',
    'POINT(-69.9312 18.4861)', -- Ensanche Naco area
    true
  ),
  (
    'c01m4d0s-0001-4000-8000-000000000002',
    'd0d8c19c-0b0d-4096-b0a6-123456789002',
    'Colmado Hermanos Pérez',
    'POINT(-69.9612 18.4561)', -- Bella Vista area
    true
  );

-- 4. Global Products
-- Using generic IDs for simplicity in reading
INSERT INTO public.global_products (id, name, category, image_url)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Cerveza Presidente (Grande)', 'Bebidas Alcohólicas', 'https://example.com/presidente-grande.jpg'),
  ('a0000000-0000-0000-0000-000000000002', 'Cerveza Presidente (Pequeña)', 'Bebidas Alcohólicas', 'https://example.com/presidente-pequena.jpg'),
  ('a0000000-0000-0000-0000-000000000003', 'Salami Induveca Super Especial', 'Embutidos', 'https://example.com/salami-induveca.jpg'),
  ('a0000000-0000-0000-0000-000000000004', 'Plátano Verde', 'Víveres', 'https://example.com/platano.jpg'),
  ('a0000000-0000-0000-0000-000000000005', 'Arroz Selecto La Garza (Libra)', 'Granos', 'https://example.com/arroz.jpg'),
  ('a0000000-0000-0000-0000-000000000006', 'Habichuelas Rojas La Famosa (Lata)', 'Enlatados', 'https://example.com/habichuelas.jpg'),
  ('a0000000-0000-0000-0000-000000000007', 'Refresco Coca-Cola 2L', 'Bebidas', 'https://example.com/coca-cola.jpg'),
  ('a0000000-0000-0000-0000-000000000008', 'Country Club Merengue 2L', 'Bebidas', 'https://example.com/country-club.jpg'),
  ('a0000000-0000-0000-0000-000000000009', 'Ron Brugal Extra Viejo', 'Bebidas Alcohólicas', 'https://example.com/brugal.jpg'),
  ('a0000000-0000-0000-0000-000000000010', 'Bolsa de Hielo', 'Otros', 'https://example.com/hielo.jpg'),
  ('a0000000-0000-0000-0000-000000000011', 'Pan de Agua (Unidad)', 'Panadería', 'https://example.com/pan-agua.jpg');

-- 5. Store Products
-- Assigning products to "Súper Colmado La Bendición"
INSERT INTO public.store_products (store_id, product_id, custom_name, price, in_stock)
VALUES
  ('c01m4d0s-0001-4000-8000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'La Preciosa Grande', 150.00, true), -- Presidente Grande
  ('c01m4d0s-0001-4000-8000-000000000001', 'a0000000-0000-0000-0000-000000000003', NULL, 120.00, true), -- Salami
  ('c01m4d0s-0001-4000-8000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Plátano Barahonero', 25.00, true), -- Plátano
  ('c01m4d0s-0001-4000-8000-000000000001', 'a0000000-0000-0000-0000-000000000007', NULL, 90.00, true), -- Coca Cola
  ('c01m4d0s-0001-4000-8000-000000000001', 'a0000000-0000-0000-0000-000000000010', 'Hielo (Funda)', 50.00, true); -- Hielo

-- Assigning products to "Colmado Hermanos Pérez"
INSERT INTO public.store_products (store_id, product_id, custom_name, price, in_stock)
VALUES
  ('c01m4d0s-0001-4000-8000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Presidente Jumbo', 160.00, true), -- Intentionally named Jumbo but using Grande ID for simplicity
  ('c01m4d0s-0001-4000-8000-000000000002', 'a0000000-0000-0000-0000-000000000008', NULL, 65.00, true), -- Country Club
  ('c01m4d0s-0001-4000-8000-000000000002', 'a0000000-0000-0000-0000-000000000011', NULL, 10.00, true); -- Pan

-- 6. Store Customer Relationships (Fiado)
-- Pedro has credit at La Bendición
INSERT INTO public.store_customer_relationships (id, store_id, customer_id, is_fiado_approved, credit_limit, current_balance)
VALUES
  (
    'f1ad0000-0001-0000-0000-000000000001',
    'c01m4d0s-0001-4000-8000-000000000001',
    'd0d8c19c-0b0d-4096-b0a6-123456789003', -- Pedro
    true,
    5000.00,
    1450.00
  );

-- 7. Balance History
-- History for Pedro
INSERT INTO public.balance_history (relationship_id, amount, type, created_at)
VALUES
  ('f1ad0000-0001-0000-0000-000000000001', 1000.00, 'credit', now() - interval '5 days'), -- Bought on credit
  ('f1ad0000-0001-0000-0000-000000000001', 500.00, 'payment', now() - interval '3 days'), -- Paid 500
  ('f1ad0000-0001-0000-0000-000000000001', 950.00, 'credit', now() - interval '1 day'); -- Bought more

-- 8. Orders
-- Luisa ordered cash from La Bendición
INSERT INTO public.orders (store_id, customer_id, status, payment_method, total)
VALUES
  (
    'c01m4d0s-0001-4000-8000-000000000001',
    'd0d8c19c-0b0d-4096-b0a6-123456789004', -- Luisa
    'delivered',
    'cash',
    450.00
  );

-- Pedro ordered with Fiado
INSERT INTO public.orders (store_id, customer_id, status, payment_method, total)
VALUES
  (
    'c01m4d0s-0001-4000-8000-000000000001',
    'd0d8c19c-0b0d-4096-b0a6-123456789003', -- Pedro
    'pending',
    'fiado',
    950.00
  );
