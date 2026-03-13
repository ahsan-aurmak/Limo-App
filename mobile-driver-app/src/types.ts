export type Screen = "login" | "home" | "booking";

export type BookingStatus =
  | "assigned"
  | "arrived"
  | "passenger_verified"
  | "trip_started"
  | "trip_completed"
  | "cancelled";

export type SyncStatus = "synced" | "pending" | "failed";

export type SourceChannel =
  | "OPERATOR_PRIVATE"
  | "HOTEL"
  | "PHONE"
  | "WALK_IN"
  | "OTHER";

export type PaymentMode = "cash" | "card" | "corporate";

export type Booking = {
  id: string;
  reference: string;
  sourceChannel: SourceChannel;
  customerName: string;
  customerMobileNumber: string;
  nationality: string;
  pickupLocationDescription: string;
  dropoffLocationDescription: string;
  pickupTimeLocal: string;
  paymentMode: PaymentMode;
  totalAmount: number;
  bookingStatus: BookingStatus;
  syncStatus: SyncStatus;
  verificationNotes?: string;
  createdBy: "operator" | "driver";
  driverName: string;
  vehiclePlateNumber: string;
  emiratesIdNumber?: string;
  passportNumber?: string;
};

export type DriverProfile = {
  id: string;
  name: string;
  permitNumber: string;
  assignedVehicle: string;
  companyName: string;
};
