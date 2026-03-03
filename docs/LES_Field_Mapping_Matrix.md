# LES Field Mapping Matrix (Canonical -> LES)

| Canonical Field | LES Field | Required for LES | Rule |
|---|---|---:|---|
| `transaction_type` | `TransactionType` | Yes | `New` or `Update` |
| `batch_id` | `BatchId` | No | Empty string if not used |
| `vehicle_permit_number` | `VehiclePermitNumber` | Conditional | Prefer this; else plate triplet required |
| `plate_number` | `PlateNumber` | Conditional | Required if no `VehiclePermitNumber` |
| `plate_code` | `PlateCode` | Conditional | Required if no `VehiclePermitNumber` |
| `plate_source` | `PlateSource` | Conditional | Required if no `VehiclePermitNumber` |
| `customer_vehicle_type` | `CustomerVehicleType` | Yes | Type of service from operator |
| `driver_permit_number` | `DriverPermitNumber` | Conditional | Prefer this; else driver fallback triplet required |
| `emirates_id_number` | `EmiratesIDNumber` | Conditional | Required if no `DriverPermitNumber` |
| `license_number` | `LicenseNumber` | Conditional | Required if no `DriverPermitNumber` |
| `license_issue_place` | `LicenseIssuePlace` | Conditional | Required if no `DriverPermitNumber` |
| `customer_name` | `CustomerName` | No | Optional in current doc revision |
| `customer_mobile_number` | `CustomerMobileNumber` | No | Optional |
| `customer_email_id` | `CustomerEmailId` | No | Optional |
| `source_trip_id` | `TripId` | Yes | Unique per source/company |
| `trip_type` | `TripType` | Yes | `TRANSFER`, `CHAUFFEUR`, `WALKIN`, other |
| `source_booking_id` | `BookingId` | Yes | Must send if available |
| `pickup_time_local` | `PickupTime` | Yes | `dd-MMM-yyyy HH:mm:ss` (Abu Dhabi timezone) |
| `pickup_location_lat,lng` | `PickupLocation` | Yes | String: `"lat,lng"` |
| `dropoff_location_lat,lng` | `DropOffLocation` | Yes | String: `"lat,lng"` |
| `pickup_location_description` | `PickupLocationDescription` | Yes | Human-readable area |
| `dropoff_location_description` | `DropOffLocationDescription` | Yes | Human-readable area |
| `duration_minutes` | `Duration` | Yes | String numeric minutes |
| `distance_km` | `Distance` | Yes | String numeric km |
| `base_fare` | `BaseFare` | Yes | Numeric |
| `discount_amount` | `DiscountAmount` | Yes | Numeric (`0` allowed) |
| `total_amount` | `TotalAmount` | Yes | Numeric |
| `tips_amount` | `TipsAmount` | No | Optional numeric/null |
| `toll_fee` | `TollFee` | No | Optional numeric/null |
| `extras` | `Extras` | No | Optional numeric/null |
| `on_contract` | `OnContract` | Yes | `0` or `1` |
| `contract_provider_name` | `ContractProviderName` | Conditional | Mandatory when `OnContract = 1` |
| `payment_mode` | `PaymentMode` | Yes | `Cash` or `Card` |
| `vehicle_type` | `VehicleType` | No | Optional (`AV`, `UAENATIONAL`, `PHC`) |
| `text_1` | `Text1` | No | Optional |
| `text_2` | `Text2` | No | Optional |
| `text_3` | `Text3` | No | Optional |
| `text_4` | `Text4` | No | Optional |
| `decimal_1` | `Decimal1` | No | Optional |
| `decimal_2` | `Decimal2` | No | Optional |

## Additional LES response mapping

| LES Response Field | Internal Store |
|---|---|
| `StatusId` | `les_submissions.status_id` |
| `StatusCode` | `les_submissions.status_code` |
| `StatusMessage` | `les_submissions.status_message` |
