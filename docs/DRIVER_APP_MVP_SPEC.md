# Driver App MVP Spec

## Purpose

This is a separate Android driver app for private limousine bookings that do not come from Uber, Careem, or inDrive.

Its job is to:

- let a driver open operator-created private bookings
- let a driver verify or complete passenger details at pickup
- let a driver create a new private/manual booking when no booking exists
- sync that data into the main Carmak web system

The main web app remains the system that prepares and submits LES-compliant trip data.

Data flow:

- Driver app -> Main system API -> Main database -> LES submission workflow

The driver app does not submit directly to LES in MVP.

## Shared Data

Only private/manual booking data should be shared from the driver app to the main app.

### Shared Booking Record

- `booking_id`
- `tenant_id`
- `source_channel`
  - `OPERATOR_PRIVATE`
  - `HOTEL`
  - `PHONE`
  - `WALK_IN`
  - `OTHER`
- `created_by`
  - `operator`
  - `driver`
- `booking_status`
  - `draft`
  - `assigned`
  - `arrived`
  - `passenger_verified`
  - `trip_started`
  - `trip_completed`
  - `cancelled`

### Shared Driver / Vehicle Context

- `driver_id`
- `driver_name`
- `driver_permit_number`
- `vehicle_id`
- `vehicle_plate_number`
- `vehicle_plate_code`
- `vehicle_plate_source`
- `vehicle_permit_number`

### Shared Passenger / Customer Data

These are based on the LES-facing fields already reflected in the current project schema.

- `customer_name`
- `customer_mobile_number`
- `customer_email_id`
- `emirates_id_number`
- `passport_number`
- `nationality`

MVP rule:

- if LES/legal process requires identity information for private bookings, the driver app must capture it before the booking can move to `passenger_verified`

### Shared Trip Data

- `transaction_type`
  - default `New`
- `trip_type`
- `pickup_time_local`
- `pickup_location_lat`
- `pickup_location_lng`
- `pickup_location_description`
- `dropoff_location_lat`
- `dropoff_location_lng`
- `dropoff_location_description`
- `pickup_verified_at`
- `trip_started_at`
- `trip_completed_at`
- `duration_minutes`
- `distance_km`

### Shared Fare / Payment Data

- `payment_mode`
- `base_fare`
- `discount_amount`
- `total_amount`
- `tips_amount`
- `toll_fee`
- `extras`
- `on_contract`
- `contract_provider_name`

### Shared Operational Metadata

- `notes`
- `verification_notes`
- `created_at`
- `updated_at`
- `device_created_offline`
- `last_synced_at`
- `sync_status`
  - `pending`
  - `synced`
  - `failed`

## Source Of Truth

This must stay clear from day one.

### Main Web App Owns

- companies / tenants
- drivers master records
- vehicles master records
- driver to vehicle assignment
- operator-created private bookings
- LES payload generation
- LES submission status
- compliance reporting

### Driver App Owns

- pickup-time verification updates
- driver-created private/manual bookings
- passenger details captured at pickup
- trip execution timestamps
- driver notes

### Shared But Main App Finalizes

- booking lifecycle state
- LES-ready normalized trip record
- any corrected compliance field after operator review

## Driver App User Flows

### Flow 1: Operator-Created Private Booking

1. Driver logs in
2. Driver sees assigned private bookings for today
3. Driver opens booking
4. Driver checks passenger identity and required trip details
5. Driver updates missing fields if needed
6. Driver taps `Verify Passenger`
7. Driver starts trip
8. Driver completes trip
9. App syncs final record to main system

### Flow 2: Driver-Created Private Booking

1. Driver opens app
2. Driver taps `New Private Booking`
3. Driver selects source:
   - hotel
   - phone
   - walk-in
   - other
4. Driver enters mandatory passenger and trip fields
5. Driver saves booking
6. Driver verifies passenger
7. Driver starts and completes trip
8. App syncs booking to main system

### Flow 3: Offline Capture

1. Driver creates or updates booking without network
2. App stores record locally
3. Booking shows `Pending Sync`
4. App retries automatically when online
5. Driver can also tap `Sync Now`

## Driver App Screens

MVP screens:

- Login
- Today Bookings
- Booking Detail
- Passenger Verification
- New Private Booking
- Sync Status
- Profile / Logout

### Today Bookings

Show:

- today private bookings
- pending verification
- pending sync
- completed trips

Primary actions:

- open booking
- create private booking
- retry sync

### Booking Detail

Show:

- booking source
- passenger details
- assigned vehicle
- pickup and dropoff
- payment mode
- trip status

Primary actions:

- verify passenger
- edit missing details
- start trip
- complete trip

### New Private Booking

Required fields for MVP:

- source channel
- passenger name
- passenger mobile number
- trip type
- pickup location description
- dropoff location description
- pickup time
- payment mode
- total amount

Conditional fields:

- emirates ID / passport fields if required by LES/legal workflow
- contract provider name if `on_contract = 1`

## API Contract

The driver app should integrate with the main system through a dedicated API namespace.

Base pattern:

- `/api/driver-app/...`

### Authentication

- `POST /api/driver-app/auth/login`
  - request: username, password, device info
  - response: access token, refresh token, driver profile

- `POST /api/driver-app/auth/refresh`

- `POST /api/driver-app/auth/logout`

### Driver Context

- `GET /api/driver-app/me`
  - returns driver profile, permits, assigned vehicle, current shift context

- `GET /api/driver-app/reference-data`
  - trip types
  - payment modes
  - source channels
  - validation rules

### Bookings

- `GET /api/driver-app/bookings?date=today`
  - assigned and relevant private bookings for the driver

- `GET /api/driver-app/bookings/:bookingId`
  - full booking detail

- `POST /api/driver-app/bookings`
  - create driver-originated private booking

- `PATCH /api/driver-app/bookings/:bookingId`
  - update editable fields before completion

- `POST /api/driver-app/bookings/:bookingId/verify-passenger`
  - marks passenger verified and sends verification fields

- `POST /api/driver-app/bookings/:bookingId/start`

- `POST /api/driver-app/bookings/:bookingId/complete`

- `POST /api/driver-app/bookings/:bookingId/cancel`

### Sync

- `POST /api/driver-app/sync/batch`
  - sends locally queued updates
  - accepts multiple offline-created records

- `GET /api/driver-app/sync/status`

## Validation Rules

The driver app should not try to know all LES rules internally. The main system should remain the final validator.

The driver app should only enforce MVP checks:

- required fields must not be empty
- pickup and dropoff must be present
- payment mode must be selected
- total amount must be valid numeric
- passenger verification cannot complete until required identity/contact fields are captured

The main app should then:

- normalize data
- run LES validation
- reject or flag non-compliant records back to operator workflow

## Sync Rules

- every create/update action should return a server version number or timestamp
- offline records should use client-generated temporary IDs
- server returns permanent IDs after sync
- app should be idempotent for retries
- duplicate prevention should key on:
  - driver
  - pickup time
  - passenger mobile
  - source channel

## Recommended Tech For APK

Use React Native for MVP.

Reason:

- same TypeScript ecosystem as current project
- faster delivery for Android APK
- easier to share validation models and API types

Recommended stack:

- React Native
- TypeScript
- React Navigation
- TanStack Query
- Zustand or small local store
- local offline storage for pending sync queue

## Build Sequence

1. Define backend API endpoints in the main system
2. Add private booking entities to the main system
3. Build driver app wireframes and form schema
4. Build Android app MVP
5. Generate internal testing APK
6. Test sync and LES downstream mapping

## Out Of Scope For MVP

- direct LES submission from mobile app
- in-app payments
- customer-facing booking flow
- full route optimization
- live chat
- public ride marketplace
