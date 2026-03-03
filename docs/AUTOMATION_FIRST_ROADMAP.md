# Carmak Automation-First Roadmap

## 1) LES Requirements Reflected in Current Design

Based on the local LES mapping and integration specs in this project:
- LES submission endpoint flow needs token + `saveTripDetails` payload.
- Required/conditional fields must be validated before submission.
- Driver/vehicle identity fallback rules are mandatory when permit numbers are missing.
- Submission must keep request/response audit trail and support retries.

Reference files:
- `docs/LES_Field_Mapping_Matrix.md`
- `docs/MVP_Hybrid_LES_Spec.md`

## 2) Automation-First Operating Model

1. Operator logs in once, configures connectors:
- LES API connector
- Uber/Careem/inDrive connectors (API where available)

2. System runs continuously in the background:
- Pull trips from provider APIs on schedule.
- Validate and normalize into LES schema.
- Push ready trips to LES automatically.

3. Operator intervention only when needed:
- Connection/authentication failure
- Data validation errors
- LES rejection responses

## 3) Manual Fallback (Kept Intentionally)

For providers/accounts without API access:
- Operator exports CSV/XLSX from provider portal.
- Uploads file to Carmak.
- Carmak validates and submits to LES.

This fallback stays active until all platforms/accounts are API-enabled.

## 4) Production Architecture Needed (Important)

True no-daily-login automation requires backend services (not only frontend):
- Scheduler/worker service (cron/queue workers)
- Secure secrets storage for API credentials
- Persistent job queue with retries and dead-letter handling
- Monitoring + alerting service (email/WhatsApp/SMS)
- Audit log and reconciliation database

## 5) Suggested Build Sequence

1. Backend foundations:
- `source_connections`, `raw_trips`, `normalized_trips`, `les_submissions`, `audit_events`

2. LES adapter:
- token management
- payload mapper
- response parser and status handling

3. Source adapters:
- API pull jobs for each provider
- upload parser and column mapping profiles

4. Operations UI:
- connector setup
- automation controls
- failure queue and resubmission
- reconciliation reports
