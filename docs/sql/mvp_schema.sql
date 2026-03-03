-- Hybrid LES MVP relational schema (PostgreSQL-style)

create table if not exists tenants (
  id uuid primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists source_connections (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  source_platform text not null check (source_platform in ('UBER', 'CAREEM', 'INDRIVE')),
  connection_type text not null check (connection_type in ('API', 'UPLOAD')),
  credentials_encrypted text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists import_batches (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  source_platform text not null check (source_platform in ('UBER', 'CAREEM', 'INDRIVE')),
  import_type text not null check (import_type in ('API_SYNC', 'FILE_UPLOAD')),
  file_name text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  total_rows int not null default 0,
  valid_rows int not null default 0,
  invalid_rows int not null default 0
);

create table if not exists raw_trips (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  batch_id uuid not null references import_batches(id),
  source_platform text not null check (source_platform in ('UBER', 'CAREEM', 'INDRIVE')),
  source_trip_id text,
  payload_json jsonb not null,
  row_number int,
  created_at timestamptz not null default now()
);

create table if not exists normalized_trips (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  batch_id uuid not null references import_batches(id),
  source_platform text not null check (source_platform in ('UBER', 'CAREEM', 'INDRIVE')),
  source_trip_id text not null,
  source_booking_id text,
  transaction_type text not null default 'New',
  trip_type text not null,

  vehicle_permit_number text,
  plate_number text,
  plate_code text,
  plate_source text,
  customer_vehicle_type text not null default '',
  vehicle_type text,

  driver_permit_number text,
  emirates_id_number text,
  license_number text,
  license_issue_place text,

  customer_name text,
  customer_mobile_number text,
  customer_email_id text,

  pickup_time_local timestamp not null,
  pickup_location_lat numeric(10,7) not null,
  pickup_location_lng numeric(10,7) not null,
  dropoff_location_lat numeric(10,7) not null,
  dropoff_location_lng numeric(10,7) not null,
  pickup_location_description text not null,
  dropoff_location_description text not null,
  duration_minutes numeric(10,2) not null,
  distance_km numeric(10,2) not null,

  base_fare numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  tips_amount numeric(12,2),
  toll_fee numeric(12,2),
  extras numeric(12,2),

  on_contract smallint not null default 0,
  contract_provider_name text,
  payment_mode text not null,

  text_1 text,
  text_2 text,
  text_3 text,
  text_4 text,
  decimal_1 numeric(12,2),
  decimal_2 numeric(12,2),

  status text not null check (status in ('IMPORTED', 'NEEDS_FIX', 'READY', 'SUBMITTED', 'FAILED', 'REJECTED')),
  validation_errors_json jsonb not null default '[]'::jsonb,
  les_submission_attempts int not null default 0,
  last_les_status_code text,
  last_les_status_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (tenant_id, source_platform, source_trip_id)
);

create table if not exists permit_cache_drivers (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  permit_number text,
  emirates_id_no text,
  tcf_number text,
  permit_status text,
  is_eligible_for_trip text,
  last_status_date timestamptz,
  source_payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists permit_cache_vehicles (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  permit_number text,
  chassis_number text,
  plate_number text,
  plate_code text,
  plate_source text,
  permit_status text,
  is_eligible_for_trip text,
  last_status_date timestamptz,
  source_payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists les_submissions (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  normalized_trip_id uuid not null references normalized_trips(id),
  attempt_number int not null,
  request_payload jsonb not null,
  response_payload jsonb,
  status_id int,
  status_code text,
  status_message text,
  submitted_at timestamptz not null default now()
);

create table if not exists audit_events (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  entity_type text not null,
  entity_id text not null,
  event_type text not null,
  actor_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_normalized_trips_status on normalized_trips (tenant_id, status);
create index if not exists idx_normalized_trips_pickup_time on normalized_trips (tenant_id, pickup_time_local);
create index if not exists idx_les_submissions_trip on les_submissions (tenant_id, normalized_trip_id);
