-- =====================================================================
-- Business logic (Postgres functions) + Row Level Security
-- =====================================================================

-- Helpers ------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Create a profile automatically whenever someone signs up -----------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, address)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'address'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Search vehicles that are free for a date range ---------------------------
-- Runs as definer so customers can see availability without being able to
-- read other customers' reservations.
create or replace function public.search_available_vehicles(
  p_start date default null,
  p_end   date default null,
  p_type  public.vehicle_type default null
)
returns setof public.vehicles
language sql stable security definer
set search_path = public
as $$
  select v.*
  from public.vehicles v
  where v.status <> 'maintenance'
    and (p_type is null or v.type = p_type)
    and (
      p_start is null or p_end is null
      or not exists (
        select 1
        from public.reservations r
        where r.vehicle_id = v.id
          and r.status in ('pending', 'confirmed', 'active')
          and daterange(r.start_date, r.end_date, '[)') && daterange(p_start, p_end, '[)')
      )
    )
  order by v.rate asc, v.brand asc;
$$;

-- Book a vehicle -------------------------------------------------------------
-- The price is calculated here, on the server, from the vehicle's daily rate.
create or replace function public.book_vehicle(
  p_vehicle_id uuid,
  p_start      date,
  p_end        date,
  p_method     public.payment_method
)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_vehicle public.vehicles;
  v_days    int;
  v_total   numeric(12, 2);
  v_id      uuid;
begin
  if auth.uid() is null then
    raise exception 'Please log in to book a vehicle.';
  end if;
  if p_start is null or p_end is null or p_end <= p_start then
    raise exception 'The return date must be after the pickup date.';
  end if;
  if p_start < (now() at time zone 'Africa/Lagos')::date then
    raise exception 'The pickup date cannot be in the past.';
  end if;

  select * into v_vehicle from public.vehicles where id = p_vehicle_id;
  if not found then
    raise exception 'This vehicle could not be found.';
  end if;
  if v_vehicle.status = 'maintenance' then
    raise exception 'This vehicle is currently unavailable.';
  end if;

  v_days  := p_end - p_start;
  v_total := v_days * v_vehicle.rate;

  begin
    insert into public.reservations (customer_id, vehicle_id, start_date, end_date, amount)
    values (auth.uid(), p_vehicle_id, p_start, p_end, v_total)
    returning id into v_id;
  exception when exclusion_violation then
    raise exception 'This vehicle was just booked for those dates. Please choose different dates or another vehicle.';
  end;

  insert into public.payments (reservation_id, amount, method)
  values (v_id, v_total, p_method);

  return v_id;
end;
$$;

-- Customer cancels their own reservation ------------------------------------
create or replace function public.cancel_reservation(p_reservation_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_res public.reservations;
begin
  select * into v_res from public.reservations
  where id = p_reservation_id and customer_id = auth.uid();

  if not found then
    raise exception 'Reservation not found.';
  end if;
  if v_res.status not in ('pending', 'confirmed') then
    raise exception 'Only pending or confirmed reservations can be cancelled.';
  end if;

  update public.reservations set status = 'cancelled' where id = v_res.id;
  update public.payments set status = 'cancelled'
  where reservation_id = v_res.id and status = 'pending';
end;
$$;

-- Admin: change a reservation's status ---------------------------------------
create or replace function public.admin_update_reservation_status(
  p_reservation_id uuid,
  p_status         public.reservation_status
)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_res public.reservations;
begin
  if not public.is_admin() then
    raise exception 'Not allowed.';
  end if;

  select * into v_res from public.reservations where id = p_reservation_id;
  if not found then
    raise exception 'Reservation not found.';
  end if;

  update public.reservations set status = p_status where id = v_res.id;

  if p_status = 'active' then
    update public.vehicles set status = 'rented'
    where id = v_res.vehicle_id and status = 'available';
  elsif p_status in ('completed', 'cancelled') then
    update public.vehicles set status = 'available'
    where id = v_res.vehicle_id
      and status = 'rented'
      and not exists (
        select 1 from public.reservations
        where vehicle_id = v_res.vehicle_id and status = 'active' and id <> v_res.id
      );
  end if;

  if p_status = 'cancelled' then
    update public.payments set status = 'cancelled'
    where reservation_id = v_res.id and status = 'pending';
  end if;
end;
$$;

-- Admin: change a payment's status --------------------------------------------
-- Marking a payment successful also confirms the pending reservation.
create or replace function public.admin_update_payment(
  p_payment_id uuid,
  p_status     public.payment_status
)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_pay public.payments;
begin
  if not public.is_admin() then
    raise exception 'Not allowed.';
  end if;

  select * into v_pay from public.payments where id = p_payment_id;
  if not found then
    raise exception 'Payment not found.';
  end if;

  update public.payments
  set status = p_status,
      payment_date = case when p_status = 'successful' then now() else payment_date end
  where id = v_pay.id;

  if p_status = 'successful' then
    update public.reservations set status = 'confirmed'
    where id = v_pay.reservation_id and status = 'pending';
  elsif p_status = 'refunded' then
    update public.reservations set status = 'cancelled'
    where id = v_pay.reservation_id and status in ('pending', 'confirmed');
  end if;
end;
$$;

-- Who may call what ----------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.search_available_vehicles(date, date, public.vehicle_type) to anon, authenticated;
grant execute on function public.is_admin()                                         to authenticated;
grant execute on function public.book_vehicle(uuid, date, date, public.payment_method) to authenticated;
grant execute on function public.cancel_reservation(uuid)                           to authenticated;
grant execute on function public.admin_update_reservation_status(uuid, public.reservation_status) to authenticated;
grant execute on function public.admin_update_payment(uuid, public.payment_status)  to authenticated;

-- Row Level Security -------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.vehicles     enable row level security;
alter table public.reservations enable row level security;
alter table public.payments     enable row level security;

-- profiles: see your own row (admins see all); edit only contact details
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, phone, address) on public.profiles to authenticated;

-- vehicles: anyone can browse, only admins can change the fleet
create policy "vehicles: public read" on public.vehicles
  for select to anon, authenticated using (true);

create policy "vehicles: admin insert" on public.vehicles
  for insert to authenticated with check (public.is_admin());
create policy "vehicles: admin update" on public.vehicles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "vehicles: admin delete" on public.vehicles
  for delete to authenticated using (public.is_admin());

-- reservations: customers read their own, admins read all.
-- All writes go through the functions above.
create policy "reservations: read own or admin" on public.reservations
  for select to authenticated
  using (customer_id = auth.uid() or public.is_admin());

revoke insert, update, delete on public.reservations from anon, authenticated;

-- payments: same rule, via the parent reservation
create policy "payments: read own or admin" on public.payments
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.reservations r
      where r.id = payments.reservation_id and r.customer_id = auth.uid()
    )
  );

revoke insert, update, delete on public.payments from anon, authenticated;
