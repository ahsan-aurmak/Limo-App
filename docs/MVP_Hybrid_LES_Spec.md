# Hybrid MVP Spec: Uber API + Careem/inDrive Upload -> LES Submission

## 1. Goal

Deliver a compliance-first system for Abu Dhabi limousine operators to register trips with LES without manual copy/paste from multiple platforms.

MVP outcome:
- Pull trips from Uber (API).
- Import trips from Careem and inDrive (CSV/XLSX exports).
- Normalize, validate, and submit to LES `saveTripDetails`.
- Track submission status, retries, and daily compliance.

## 2. Primary User

- Compliance/operations staff in limousine company.
- Secondary user: business owner/GM for monitoring and reports.

## 3. In Scope (MVP)

1. Multi-tenant company onboarding.
2. Source ingestion:
- Uber API sync job.
- Careem/inDrive file upload and mapping.
3. LES integration:
- `getToken`
- `getVehiclePermits`
- `getDriverPermits`
- `saveTripDetails`
4. Validation + enrichment engine.
5. Submission queue with retries and audit logs.
6. Reconciliation dashboard + CSV export.

## 4. Out of Scope (MVP)

1. Dispatch optimization.
2. Driver mobile app.
3. Full accounting/ERP modules (GL, payroll, procurement).

## 5. System Flow

1. Ingest
- Uber trips pulled via scheduled sync (`hourly`).
- Careem/inDrive exports uploaded manually by operator.

2. Normalize
- Convert source-specific fields to canonical trip schema.
- Store original row JSON for traceability.

3. Validate
- LES-required field validation.
- Data format checks.
- Permit eligibility checks via cached LES permit sync.

4. Submit
- Send valid records to LES `saveTripDetails`.
- Persist request/response payloads.
- Retry transient failures.

5. Reconcile
- Produce daily summary: imported, submitted, failed, pending fixes.

## 6. Canonical Trip Model (Core Fields)

```txt
tenant_id
source_platform            (UBER | CAREEM | INDRIVE)
source_trip_id
source_booking_id
trip_type                  (TRANSFER | CHAUFFEUR | WALKIN | OTHER)
transaction_type           (New | Update)

vehicle_permit_number
plate_number
plate_code
plate_source
customer_vehicle_type
vehicle_type               (optional)

driver_permit_number
emirates_id_number
license_number
license_issue_place

customer_name              (optional)
customer_mobile_number     (optional)
customer_email_id          (optional)

pickup_time_utc
pickup_location_lat
pickup_location_lng
dropoff_location_lat
dropoff_location_lng
pickup_location_description
dropoff_location_description
duration_minutes
distance_km

base_fare
discount_amount
total_amount
tips_amount                (optional)
toll_fee                   (optional)
extras                     (optional)

on_contract                (0|1)
contract_provider_name     (required if on_contract=1)
payment_mode               (Cash | Card)

status                     (IMPORTED | NEEDS_FIX | READY | SUBMITTED | FAILED | REJECTED)
validation_errors_json
les_submission_attempts
last_les_status_code
last_les_status_message
```

## 7. LES Field Mapping Contract

See full matrix in: `docs/LES_Field_Mapping_Matrix.md`

Key mapping rules:
1. `TripId` <- canonical `source_trip_id` (or generated unique internal id if missing).
2. `BookingId` <- source booking id (if missing, use empty string only if allowed by authority; prefer value).
3. Vehicle identity:
- Prefer `VehiclePermitNumber`.
- Else send `PlateNumber + PlateCode + PlateSource`.
4. Driver identity:
- Prefer `DriverPermitNumber`.
- Else send `EmiratesIDNumber + LicenseNumber + LicenseIssuePlace`.
5. `PickupTime` format must be `dd-MMM-yyyy HH:mm:ss` (Abu Dhabi timezone).
6. `PickupLocation` and `DropOffLocation` must be `lat,lng` string.
7. If `OnContract = 1`, `ContractProviderName` is mandatory.

## 8. Validation Rules (MVP)

### 8.1 Hard Reject (do not submit to LES)

1. Missing both `VehiclePermitNumber` and full plate triple.
2. Missing both `DriverPermitNumber` and full driver ID fallback triple.
3. Missing `TripId`, `TripType`, `BookingId`, `PickupTime`, `PickupLocation`, `DropOffLocation`.
4. Invalid coordinate format.
5. Invalid `PickupTime` format conversion.
6. `OnContract = 1` and empty `ContractProviderName`.
7. `total_amount < 0` or any fare component non-numeric.

### 8.2 Soft Warn (submit allowed, but flagged)

1. Missing customer fields (`name/mobile/email`) since currently non-mandatory in LES doc.
2. Missing optional fields (`tips/toll/extras/vehicle_type/text/decimal`).

### 8.3 Permit Eligibility Gate

Before submit:
1. Driver from LES cache has `IsEligibleForTrip = Yes`.
2. Vehicle from LES cache has `IsEligibleForTrip = Yes`.

If either is `No` -> `NEEDS_FIX` or `FAILED` depending on policy.

## 9. Source Ingestion Specs

### 9.1 Uber API Ingestion

1. Scheduler: hourly incremental by `trip_completed_at`.
2. Dedup key: `(tenant_id, source_platform, source_trip_id)`.
3. Retry backoff for API errors: `1m`, `5m`, `15m`, `60m`.
4. Store raw API JSON in `raw_trips`.

### 9.2 Careem/inDrive Upload

1. Accept `.csv`, `.xlsx`.
2. User maps columns to canonical fields (saved mapping profile per platform).
3. Parsing report:
- total rows
- valid rows
- invalid rows with row-level errors

Template header file:
- `docs/templates/careem_indrive_upload_template.csv`

## 10. LES Submission Strategy

1. Queue records in `READY`.
2. Batch size: start with 100 per worker cycle.
3. Submission idempotency key:
- `tenant_id + source_platform + source_trip_id + transaction_type`.
4. Retry policy:
- network/timeout: retry up to 5 attempts.
- LES validation error: mark `REJECTED` and require manual correction.
5. Persist:
- request payload
- LES response (`StatusId`, `StatusCode`, `StatusMessage`)
- timestamp and attempt number

## 11. Internal APIs (MVP)

1. `POST /api/v1/uber/sync/run`
2. `POST /api/v1/imports/upload`
3. `POST /api/v1/imports/{batchId}/map`
4. `GET /api/v1/trips?status=&source=&dateFrom=&dateTo=`
5. `PATCH /api/v1/trips/{tripId}` (manual fixes)
6. `POST /api/v1/les/submit` (bulk ready)
7. `POST /api/v1/les/retry-failed`
8. `GET /api/v1/reports/daily-compliance?date=YYYY-MM-DD`

## 12. Database Tables (MVP)

1. `tenants`
2. `source_connections`
3. `import_batches`
4. `raw_trips`
5. `normalized_trips`
6. `permit_cache_drivers`
7. `permit_cache_vehicles`
8. `les_submissions`
9. `audit_events`

## 13. Dashboard Metrics

1. Trips imported today.
2. Trips submitted to LES today.
3. Submission success rate.
4. Failed/rejected queue count.
5. Oldest unsubmitted trip age.

## 14. Security and Compliance

1. Encrypt API credentials at rest.
2. Mask PII in logs.
3. Tenant data isolation.
4. Full immutable audit trail for regulator inquiries.

## 15. Delivery Plan (4 weeks)

1. Week 1:
- Canonical schema, upload parser, mapping profiles.

2. Week 2:
- Uber ingest job + LES auth + permit sync.

3. Week 3:
- Validation engine + LES submission queue + retry.

4. Week 4:
- Dashboard, reconciliation reports, UAT with pilot operators.
