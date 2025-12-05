-- Enable PostGIS extension for location
create extension if not exists postgis;

-- Create custom types
create type user_role as enum ('customer', 'owner', 'driver');
create type order_status as enum ('pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
create type payment_method as enum ('cash', 'credit_card', 'fiado');
create type balance_type as enum ('credit', 'debit', 'payment');

-- Profiles
create table profiles (
  id uuid references auth.users not null primary key,
  role user_role not null default 'customer',
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Colmados (Stores)
create table colmados (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) not null,
  name text not null,
  location geography(point) not null,
  is_open boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Global Products
create table global_products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text,
  image_url text,
  created_at timestamptz default now()
);

-- Store Products
create table store_products (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references colmados(id) not null,
  product_id uuid references global_products(id) not null,
  custom_name text, -- Optional override
  price numeric not null,
  in_stock boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references colmados(id) not null,
  customer_id uuid references profiles(id) not null,
  status order_status default 'pending',
  payment_method payment_method not null,
  total numeric not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Fiado System: Store Customer Relationships
create table store_customer_relationships (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references colmados(id) not null,
  customer_id uuid references profiles(id) not null,
  is_fiado_approved boolean default false,
  credit_limit numeric default 0,
  current_balance numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(store_id, customer_id)
);

-- Fiado System: Balance History
create table balance_history (
  id uuid default gen_random_uuid() primary key,
  relationship_id uuid references store_customer_relationships(id) not null,
  amount numeric not null,
  type balance_type not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table colmados enable row level security;
alter table global_products enable row level security;
alter table store_products enable row level security;
alter table orders enable row level security;
alter table store_customer_relationships enable row level security;
alter table balance_history enable row level security;

-- RLS Policies

-- Profiles:
-- Users can view their own profile.
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
-- Users can insert their own profile.
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);
-- Users can update their own profile.
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);
-- Owners can view profiles of customers with orders at their store.
create policy "Owners can view customer profiles" on profiles
  for select using (
    exists (
      select 1 from orders
      join colmados on colmados.id = orders.store_id
      where orders.customer_id = profiles.id
      and colmados.owner_id = auth.uid()
    )
    or
    exists (
      select 1 from store_customer_relationships
      join colmados on colmados.id = store_customer_relationships.store_id
      where store_customer_relationships.customer_id = profiles.id
      and colmados.owner_id = auth.uid()
    )
  );

-- Colmados:
-- Everyone can view open colmados (or all colmados).
create policy "Anyone can view colmados" on colmados
  for select using (true);
-- Owners can update their own colmados.
create policy "Owners can update own colmados" on colmados
  for update using (auth.uid() = owner_id);
-- Owners can insert their own colmados.
create policy "Owners can insert own colmados" on colmados
  for insert with check (auth.uid() = owner_id);

-- Global Products:
-- Everyone can view global products.
create policy "Anyone can view global products" on global_products
  for select using (true);

-- Store Products:
-- Everyone can view store products.
create policy "Anyone can view store products" on store_products
  for select using (true);
-- Owners can manage their store products.
create policy "Owners can manage store products" on store_products
  for all using (
    exists (
      select 1 from colmados
      where colmados.id = store_products.store_id
      and colmados.owner_id = auth.uid()
    )
  );

-- Orders:
-- Customers can view their own orders.
create policy "Customers can view own orders" on orders
  for select using (auth.uid() = customer_id);
-- Customers can create orders.
create policy "Customers can create orders" on orders
  for insert with check (auth.uid() = customer_id);
-- Owners can view orders for their store.
create policy "Owners can view store orders" on orders
  for select using (
    exists (
      select 1 from colmados
      where colmados.id = orders.store_id
      and colmados.owner_id = auth.uid()
    )
  );
-- Owners can update orders for their store (e.g. status).
create policy "Owners can update store orders" on orders
  for update using (
    exists (
      select 1 from colmados
      where colmados.id = orders.store_id
      and colmados.owner_id = auth.uid()
    )
  );

-- Store Customer Relationships:
-- Customers can view their own relationships (balances).
create policy "Customers can view own relationships" on store_customer_relationships
  for select using (auth.uid() = customer_id);
-- Owners can view relationships for their store.
create policy "Owners can view store relationships" on store_customer_relationships
  for select using (
    exists (
      select 1 from colmados
      where colmados.id = store_customer_relationships.store_id
      and colmados.owner_id = auth.uid()
    )
  );
-- Owners can update relationships for their store (approve fiado, change limit).
create policy "Owners can update store relationships" on store_customer_relationships
  for update using (
    exists (
      select 1 from colmados
      where colmados.id = store_customer_relationships.store_id
      and colmados.owner_id = auth.uid()
    )
  );
-- Owners can insert relationships.
create policy "Owners can insert store relationships" on store_customer_relationships
  for insert with check (
    exists (
      select 1 from colmados
      where colmados.id = store_customer_relationships.store_id
      and colmados.owner_id = auth.uid()
    )
  );

-- Balance History:
-- Customers can view their own history.
create policy "Customers can view own balance history" on balance_history
  for select using (
    exists (
      select 1 from store_customer_relationships
      where store_customer_relationships.id = balance_history.relationship_id
      and store_customer_relationships.customer_id = auth.uid()
    )
  );
-- Owners can view history for their store.
create policy "Owners can view store balance history" on balance_history
  for select using (
    exists (
      select 1 from store_customer_relationships scr
      join colmados c on c.id = scr.store_id
      where scr.id = balance_history.relationship_id
      and c.owner_id = auth.uid()
    )
  );
-- Owners can insert history (record payment or change).
create policy "Owners can insert balance history" on balance_history
  for insert with check (
    exists (
      select 1 from store_customer_relationships scr
      join colmados c on c.id = scr.store_id
      where scr.id = balance_history.relationship_id
      and c.owner_id = auth.uid()
    )
  );
