-- =====================================================================
-- Car Rental Management System : core schema
-- Tables follow Chapter 3 (Customer, Vehicle, Reservation, Payment,
-- Administrator). Customers and administrators share one `profiles`
-- table (linked to Supabase Auth) and are told apart by `role`.
-- =====================================================================

create extension if not exists btree_gist;

create type public.user_role          as enum ('customer', 'admin');
create type public.vehicle_type       as enum ('sedan', 'hatchback', 'suv', 'pickup', 'bus', 'luxury');
create type public.vehicle_status     as enum ('available', 'rented', 'maintenance');
create type public.reservation_status as enum ('pending', 'confirmed', 'active', 'completed', 'cancelled');
create type public.payment_method     as enum ('bank_transfer', 'ussd');
create type public.payment_status     as enum ('pending', 'successful', 'failed', 'refunded', 'cancelled');

-- Customer + Administrator ----------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  email      text not null default '',
  phone      text,
  address    text,
  role       public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- Vehicle ----------------------------------------------------------------
create table public.vehicles (
  id              uuid primary key default gen_random_uuid(),
  registration_no text not null unique,
  brand           text not null,
  model           text not null,
  year            int  not null check (year between 1990 and 2100),
  type            public.vehicle_type   not null default 'sedan',
  color           text,
  seats           int  not null default 5 check (seats between 1 and 60),
  transmission    text not null default 'automatic' check (transmission in ('automatic', 'manual')),
  fuel            text not null default 'petrol'    check (fuel in ('petrol', 'diesel', 'hybrid', 'electric')),
  rate            numeric(12, 2) not null check (rate > 0),  -- price per day in Naira
  status          public.vehicle_status not null default 'available',
  image_url       text,
  description     text,
  created_at      timestamptz not null default now()
);

-- Reservation ------------------------------------------------------------
create table public.reservations (
  id          uuid primary key default gen_random_uuid(),
  reference   text not null unique
              default ('CR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  vehicle_id  uuid not null references public.vehicles (id) on delete restrict,
  start_date  date not null,
  end_date    date not null,
  amount      numeric(12, 2) not null check (amount >= 0),
  status      public.reservation_status not null default 'pending',
  created_at  timestamptz not null default now(),
  constraint reservations_dates_check check (end_date > start_date),
  -- The database itself refuses double bookings: the same vehicle cannot
  -- have two live reservations whose date ranges overlap.
  constraint reservations_no_double_booking exclude using gist (
    vehicle_id with =,
    daterange(start_date, end_date, '[)') with &&
  ) where (status in ('pending', 'confirmed', 'active'))
);

-- Payment ----------------------------------------------------------------
create table public.payments (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  reference      text not null unique
                 default ('PAY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  amount         numeric(12, 2) not null check (amount >= 0),
  method         public.payment_method not null,
  status         public.payment_status not null default 'pending',
  payment_date   timestamptz,
  created_at     timestamptz not null default now()
);

create index reservations_customer_idx on public.reservations (customer_id);
create index reservations_vehicle_idx  on public.reservations (vehicle_id);
create index reservations_status_idx   on public.reservations (status);
create index payments_reservation_idx  on public.payments (reservation_id);
create index payments_status_idx       on public.payments (status);
