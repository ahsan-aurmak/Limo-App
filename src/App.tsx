import {
  Alert,
  App as AntdApp,
  Avatar,
  Button,
  Card,
  Col,
  ConfigProvider,
  Divider,
  Dropdown,
  Form,
  Image,
  Input,
  Layout,
  Menu,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import type { MenuProps, TableProps, UploadProps } from "antd";
import {
  ArrowRightOutlined,
  BarChartOutlined,
  BellOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  DollarOutlined,
  DownOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  LinkOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EyeOutlined,
  PaperClipOutlined,
  SafetyOutlined,
  SettingOutlined,
  SyncOutlined,
  UploadOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import uberLogo from "./assets/uber.svg";
import careemLogo from "./assets/careem.svg";
import indriveLogo from "./assets/indrive.svg";

type MenuKey =
  | "dashboard"
  | "les"
  | "vehicles"
  | "drivers"
  | "finance"
  | "reports"
  | "settings";

type LesTabKey = "overview" | "submission" | "connections" | "automation" | "history";
type FinanceTabKey = "earnings" | "expenses" | "whatsapp";

type Platform = "UBER" | "CAREEM" | "INDRIVE";
type Mode = "API" | "UPLOAD";
type AuthMethod = "OAUTH_CLIENT_CREDENTIALS" | "API_KEY" | "BEARER_TOKEN";
type ConnectionHealth = "NOT_TESTED" | "CONNECTED" | "FAILED";
type AutomationSchedule = "15_MIN" | "30_MIN" | "60_MIN";
type IngestSource = "API" | "UPLOAD";
type IngestStatus = "SUCCESS" | "PARTIAL" | "WAITING";

type LoginFormValues = {
  username: string;
  password: string;
};

type ConnectorFormValues = {
  accountId?: string;
  authMethod?: AuthMethod;
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
};

type LesConnectorFormValues = {
  baseUrl?: string;
  companyId?: string;
  clientId?: string;
  clientSecret?: string;
};

type CompanyFormValues = {
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
};

type ConnectorPreferences = {
  modes: Record<Platform, Mode>;
  authMethods: Record<Platform, AuthMethod>;
};

type PlatformRow = {
  key: string;
  platform: Platform;
  mode: string;
  todayImported: number;
  readyForLes: number;
  failed: number;
  status: "good" | "attention";
};

type IngestRun = {
  key: string;
  platform: Platform;
  source: IngestSource;
  fetched: number;
  mapped: number;
  failed: number;
  status: IngestStatus;
  runAt: string;
};

type FailedTrip = {
  key: string;
  platform: Platform;
  tripRef: string;
  driverName: string;
  vehicleCode: string;
  field: string;
  issue: string;
  lastAttempt: string;
};

type SubmissionHistoryRow = {
  key: string;
  startedAt: string;
  scope: string;
  ready: number;
  submitted: number;
  failed: number;
  durationSec: number;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
};

type FleetVehicle = {
  key: string;
  plate: string;
  model: string;
  year: number;
  vin: string;
  captain: string;
  platformMix: string;
  status: "ON_TRIP" | "IDLE" | "OFFLINE";
  operationalStatus: "ACTIVE" | "IN_SERVICE" | "UNDER_REPAIR" | "OFF_SERVICE";
  onRoadHours: number;
  offRoadHours: number;
  completedTrips: number;
  utilizationPct: number;
  lastSeen: string;
  docsExpiry: string;
  trackerName: string;
  x: number;
  y: number;
};

type DriverPayout = {
  key: string;
  driver: string;
  totalEarnings: number;
  refundsExpenses: number;
  payouts: number;
  netEarnings: number;
};

type DriverCompliance = {
  key: string;
  name: string;
  emiratesId: string;
  licenseNo: string;
  permitNo: string;
  phone: string;
  assignedPlate: string;
  status: "ACTIVE" | "SICK" | "ON_LEAVE" | "LEFT";
  completedTrips: number;
  acceptanceRate: number;
  onlineHours: number;
  cancellationRate: number;
  compliance: "VALID" | "EXPIRING_SOON" | "MISSING";
};

type ExpenseCategory = "FUEL" | "BREAKDOWN" | "FINE" | "MAINTENANCE" | "INSURANCE" | "OTHER";

type ExpenseEntry = {
  key: string;
  date: string;
  category: ExpenseCategory;
  vehiclePlate: string;
  driverName?: string;
  amount: number;
  notes: string;
};

type WhatsAppReceiptStatus = "NEW" | "AI_REVIEWED" | "APPROVED" | "REJECTED";

type WhatsAppReceipt = {
  key: string;
  receivedAt: string;
  driverPhone: string;
  driverName: string;
  vehiclePlate: string;
  merchant: string;
  receiptNo: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  purpose: string;
  confidence: number;
  status: WhatsAppReceiptStatus;
  aiNotes: string;
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentSource?: "WHATSAPP" | "MANUAL";
};

type ExpenseFormValues = {
  date?: string;
  category?: ExpenseCategory;
  vehiclePlate?: string;
  driverName?: string;
  amount?: string;
  notes?: string;
};

type DriverFormValues = {
  name?: string;
  emiratesId?: string;
  licenseNo?: string;
  permitNo?: string;
  phone?: string;
  assignedPlate?: string;
  status?: DriverCompliance["status"];
  compliance?: DriverCompliance["compliance"];
};

type VehicleFormValues = {
  plate?: string;
  model?: string;
  year?: string;
  vin?: string;
  trackerName?: string;
  platformMix?: string;
  captain?: string;
  status?: FleetVehicle["status"];
  operationalStatus?: FleetVehicle["operationalStatus"];
};

type ReportJob = {
  key: string;
  name: string;
  period: string;
  generatedAt: string;
  status: "READY" | "GENERATING";
};

type CaptainEarningsRow = {
  key: string;
  driver: string;
  status: DriverCompliance["status"];
  assignedPlate: string;
  totalEarnings: number;
  refundsExpenses: number;
  payouts: number;
  netEarnings: number;
};

type LesRunScope =
  | { type: "ready-all" }
  | { type: "failed-all" }
  | { type: "failed-platform"; platform: Platform };

const CONNECTOR_PREFS_STORAGE_KEY = "carmak.connector.preferences.v2";

const APP_LOGIN_CREDENTIALS = {
  username: "operator",
  password: "Carmak@2026",
} as const;

const platformLogoMap: Record<Platform, string> = {
  UBER: uberLogo,
  CAREEM: careemLogo,
  INDRIVE: indriveLogo,
};

const platformNameMap: Record<Platform, string> = {
  UBER: "Uber",
  CAREEM: "Careem",
  INDRIVE: "inDrive",
};

const authMethodLabelMap: Record<AuthMethod, string> = {
  OAUTH_CLIENT_CREDENTIALS: "OAuth Client Credentials",
  API_KEY: "API Key",
  BEARER_TOKEN: "Bearer Token",
};

const scheduleLabelMap: Record<AutomationSchedule, string> = {
  "15_MIN": "Every 15 minutes",
  "30_MIN": "Every 30 minutes",
  "60_MIN": "Every 60 minutes",
};

const defaultModes: Record<Platform, Mode> = {
  UBER: "API",
  CAREEM: "UPLOAD",
  INDRIVE: "UPLOAD",
};

const defaultAuthMethods: Record<Platform, AuthMethod> = {
  UBER: "OAUTH_CLIENT_CREDENTIALS",
  CAREEM: "API_KEY",
  INDRIVE: "API_KEY",
};

const sectionMeta: Record<MenuKey, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Central view for fleet, drivers, money, and LES operations in one place.",
  },
  les: {
    title: "LES Center",
    subtitle: "All LES work in one place with tabs for submission, setup, automation, and run history.",
  },
  vehicles: {
    title: "Vehicles",
    subtitle: "Vehicle map, assignment, and operational status for the full fleet.",
  },
  drivers: {
    title: "Drivers",
    subtitle: "Driver IDs, permits, assigned vehicle, and compliance readiness.",
  },
  finance: {
    title: "Money",
    subtitle: "Track earnings, expenses, and payouts across all captains.",
  },
  reports: {
    title: "Reports",
    subtitle: "Generate downloadable operational, LES, and financial reports.",
  },
  settings: {
    title: "Settings",
    subtitle: "Manage company profile and operator notifications.",
  },
};

const initialPlatformRows: PlatformRow[] = [
  {
    key: "1",
    platform: "UBER",
    mode: "API Connector",
    todayImported: 624,
    readyForLes: 601,
    failed: 8,
    status: "good",
  },
  {
    key: "2",
    platform: "CAREEM",
    mode: "Export Upload",
    todayImported: 221,
    readyForLes: 184,
    failed: 14,
    status: "attention",
  },
  {
    key: "3",
    platform: "INDRIVE",
    mode: "Export Upload",
    todayImported: 152,
    readyForLes: 110,
    failed: 11,
    status: "attention",
  },
];

const initialIngestRuns: IngestRun[] = [
  {
    key: "ir-1",
    platform: "UBER",
    source: "API",
    fetched: 140,
    mapped: 137,
    failed: 3,
    status: "PARTIAL",
    runAt: "03 Mar, 09:41 AM",
  },
  {
    key: "ir-2",
    platform: "CAREEM",
    source: "UPLOAD",
    fetched: 88,
    mapped: 84,
    failed: 4,
    status: "PARTIAL",
    runAt: "03 Mar, 09:16 AM",
  },
  {
    key: "ir-3",
    platform: "INDRIVE",
    source: "UPLOAD",
    fetched: 62,
    mapped: 61,
    failed: 1,
    status: "SUCCESS",
    runAt: "03 Mar, 08:59 AM",
  },
];

const initialSubmissionHistory: SubmissionHistoryRow[] = [
  {
    key: "les-1",
    startedAt: "03 Mar, 09:50 AM",
    scope: "Ready trips (all platforms)",
    ready: 248,
    submitted: 244,
    failed: 4,
    durationSec: 68,
    status: "PARTIAL",
  },
  {
    key: "les-2",
    startedAt: "03 Mar, 08:20 AM",
    scope: "Ready trips (all platforms)",
    ready: 216,
    submitted: 216,
    failed: 0,
    durationSec: 54,
    status: "SUCCESS",
  },
];

const driverNameSeed = [
  "Issam Alsloot",
  "Sami Ullah Jan",
  "Amin Khan",
  "Haris Ali",
  "Muhammad Zubair",
  "Ayub",
  "Muhammad Naeem",
  "Qasim Ali Hussain",
  "Muhammad Nawaz",
  "Hasnain Javed",
] as const;

const vehicleModelSeed = [
  "Toyota Camry",
  "Kia Carnival",
  "Hyundai Sonata",
  "Nissan Altima",
  "Honda Accord",
  "Lexus ES 350",
  "Toyota Innova",
] as const;

const platformMixSeed = ["Uber", "Careem", "inDrive", "Uber + Careem", "Careem + inDrive", "Uber + inDrive"] as const;

const createFleetVehicles = (count: number): FleetVehicle[] =>
  Array.from({ length: count }, (_value, index) => {
    const id = index + 1;
    const operationalStatus: FleetVehicle["operationalStatus"] =
      id % 17 === 0 ? "UNDER_REPAIR" : id % 11 === 0 ? "IN_SERVICE" : id % 23 === 0 ? "OFF_SERVICE" : "ACTIVE";
    const status: FleetVehicle["status"] =
      operationalStatus !== "ACTIVE" ? "OFFLINE" : id % 7 === 0 ? "OFFLINE" : id % 3 === 0 ? "IDLE" : "ON_TRIP";
    const onRoadHours = operationalStatus === "ACTIVE" ? 7 + ((id * 3) % 12) : 0;
    const offRoadHours = 24 - onRoadHours;
    const completedTrips = operationalStatus === "ACTIVE" ? 8 + ((id * 5) % 22) : 0;
    const utilizationPct = Math.round((onRoadHours / 24) * 100);
    return {
      key: `v-${id}`,
      plate: `AUH-${36000 + id}`,
      model: vehicleModelSeed[index % vehicleModelSeed.length],
      year: 2021 + (index % 5),
      vin: `WDB${String(910000 + id).padStart(9, "0")}`,
      captain: `${driverNameSeed[index % driverNameSeed.length]} ${Math.floor(index / driverNameSeed.length) + 1}`,
      platformMix: platformMixSeed[index % platformMixSeed.length],
      status,
      operationalStatus,
      onRoadHours,
      offRoadHours,
      completedTrips,
      utilizationPct,
      lastSeen: `03 Mar, 10:${String((id * 3) % 60).padStart(2, "0")} AM`,
      docsExpiry: `${String((id % 27) + 1).padStart(2, "0")} ${["Apr", "May", "Jun"][id % 3]} 2026`,
      trackerName: `Unit-${8000 + id}`,
      x: 8 + ((id * 17) % 84),
      y: 8 + ((id * 13) % 84),
    };
  });

const initialFleetVehicles: FleetVehicle[] = createFleetVehicles(50);

const initialDriverCompliance: DriverCompliance[] = initialFleetVehicles.map((vehicle, index) => ({
  key: `dc-${index + 1}`,
  name: vehicle.captain,
  emiratesId: `784-198${index % 10}-${String(2000000 + index).padStart(7, "0")}-${(index % 9) + 1}`,
  licenseNo: `DL-AUH-${String(410000 + index).padStart(6, "0")}`,
  permitNo: `LIMO-${String(78000 + index).padStart(6, "0")}`,
  phone: `+971 50 ${String(2000000 + index).slice(-7)}`,
  assignedPlate: vehicle.plate,
  status: index % 19 === 0 ? "LEFT" : index % 13 === 0 ? "SICK" : index % 11 === 0 ? "ON_LEAVE" : "ACTIVE",
  completedTrips: 75 + ((index * 7) % 310),
  acceptanceRate: Number((88 + ((index * 3) % 12) + ((index % 10) / 10)).toFixed(1)),
  onlineHours: Number((5 + ((index * 2.3) % 8)).toFixed(1)),
  cancellationRate: Number((1 + ((index * 1.7) % 4)).toFixed(1)),
  compliance: index % 13 === 0 ? "MISSING" : index % 9 === 0 ? "EXPIRING_SOON" : "VALID",
}));

const initialDriverPayouts: DriverPayout[] = initialFleetVehicles.slice(0, 16).map((vehicle, index) => {
  const totalEarnings = 120 + (index % 7) * 46.35;
  const refundsExpenses = index % 4 === 0 ? 12 : index % 3 === 0 ? 6 : 0;
  const payouts = index % 5 === 0 ? 82.5 : index % 2 === 0 ? 24 : 0;
  return {
    key: `d-${index + 1}`,
    driver: vehicle.captain,
    totalEarnings,
    refundsExpenses,
    payouts,
    netEarnings: Number((totalEarnings - refundsExpenses - payouts).toFixed(2)),
  };
});

const initialExpenses: ExpenseEntry[] = [
  {
    key: "e-1",
    date: "2026-03-03",
    category: "FUEL",
    vehiclePlate: "AUH-36001",
    driverName: "Issam Alsloot 1",
    amount: 188.4,
    notes: "ADNOC recharge",
  },
  {
    key: "e-2",
    date: "2026-03-03",
    category: "FINE",
    vehiclePlate: "AUH-36009",
    driverName: "Qasim Ali Hussain 1",
    amount: 600,
    notes: "Speed camera - SZR",
  },
  {
    key: "e-3",
    date: "2026-03-02",
    category: "BREAKDOWN",
    vehiclePlate: "AUH-36017",
    driverName: "Muhammad Naeem 2",
    amount: 920,
    notes: "Alternator replacement",
  },
  {
    key: "e-4",
    date: "2026-03-02",
    category: "MAINTENANCE",
    vehiclePlate: "AUH-36011",
    driverName: "Sami Ullah Jan 2",
    amount: 280,
    notes: "Oil + filter",
  },
];

const buildReceiptPreviewSvg = (merchant: string, amount: number, date: string, receiptNo: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <rect width="900" height="1200" fill="#f7f7f7"/>
      <rect x="40" y="40" width="820" height="1120" rx="18" fill="#ffffff" stroke="#d9d9d9" stroke-width="4"/>
      <text x="80" y="130" font-family="Arial, sans-serif" font-size="52" fill="#111111" font-weight="700">WhatsApp Shared Receipt</text>
      <line x1="80" y1="170" x2="820" y2="170" stroke="#e5e7eb" stroke-width="3"/>
      <text x="80" y="250" font-family="Arial, sans-serif" font-size="38" fill="#6b7280">Merchant</text>
      <text x="80" y="305" font-family="Arial, sans-serif" font-size="44" fill="#111111" font-weight="600">${merchant}</text>
      <text x="80" y="390" font-family="Arial, sans-serif" font-size="38" fill="#6b7280">Date</text>
      <text x="80" y="445" font-family="Arial, sans-serif" font-size="44" fill="#111111">${date}</text>
      <text x="80" y="530" font-family="Arial, sans-serif" font-size="38" fill="#6b7280">Receipt #</text>
      <text x="80" y="585" font-family="Arial, sans-serif" font-size="44" fill="#111111">${receiptNo}</text>
      <text x="80" y="670" font-family="Arial, sans-serif" font-size="38" fill="#6b7280">Amount</text>
      <text x="80" y="740" font-family="Arial, sans-serif" font-size="72" fill="#166534" font-weight="700">AED ${amount.toFixed(2)}</text>
      <rect x="80" y="830" width="740" height="240" rx="14" fill="#f3f4f6"/>
      <text x="110" y="905" font-family="Arial, sans-serif" font-size="34" fill="#4b5563">Prototype preview image for workflow testing.</text>
      <text x="110" y="965" font-family="Arial, sans-serif" font-size="34" fill="#4b5563">Replace with original photo by clicking Attach/Replace.</text>
    </svg>`,
  )}`;

const initialWhatsAppReceipts: WhatsAppReceipt[] = [
  {
    key: "wa-1",
    receivedAt: "03 Mar, 08:14 AM",
    driverPhone: "+971 50 2000001",
    driverName: "Issam Alsloot 1",
    vehiclePlate: "AUH-36001",
    merchant: "ADNOC Al Reem",
    receiptNo: "ADN-882910",
    date: "2026-03-03",
    amount: 188.4,
    category: "FUEL",
    purpose: "Fuel top-up",
    confidence: 94,
    status: "AI_REVIEWED",
    aiNotes: "High confidence match by phone and active assignment.",
    attachmentName: "wa_fuel_0303_adnoc.jpg",
    attachmentUrl: buildReceiptPreviewSvg("ADNOC Al Reem", 188.4, "2026-03-03", "ADN-882910"),
    attachmentSource: "WHATSAPP",
  },
  {
    key: "wa-2",
    receivedAt: "03 Mar, 09:21 AM",
    driverPhone: "+971 50 2000013",
    driverName: "Muhammad Naeem 2",
    vehiclePlate: "AUH-36017",
    merchant: "Al Noor Garage",
    receiptNo: "GAR-44102",
    date: "2026-03-03",
    amount: 920,
    category: "BREAKDOWN",
    purpose: "Alternator replacement",
    confidence: 78,
    status: "NEW",
    aiNotes: "Needs AI review.",
    attachmentName: "wa_garage_0303.jpg",
    attachmentUrl: buildReceiptPreviewSvg("Al Noor Garage", 920, "2026-03-03", "GAR-44102"),
    attachmentSource: "WHATSAPP",
  },
  {
    key: "wa-3",
    receivedAt: "03 Mar, 09:42 AM",
    driverPhone: "+971 50 2000009",
    driverName: "Qasim Ali Hussain 1",
    vehiclePlate: "AUH-36009",
    merchant: "Abu Dhabi Police",
    receiptNo: "FINE-55111",
    date: "2026-03-03",
    amount: 600,
    category: "FINE",
    purpose: "Traffic fine payment",
    confidence: 87,
    status: "AI_REVIEWED",
    aiNotes: "Category recognized as fine; verify violation reference.",
    attachmentName: "wa_fine_0303.jpg",
    attachmentUrl: buildReceiptPreviewSvg("Abu Dhabi Police", 600, "2026-03-03", "FINE-55111"),
    attachmentSource: "WHATSAPP",
  },
  {
    key: "wa-4",
    receivedAt: "03 Mar, 10:05 AM",
    driverPhone: "+971 50 2000004",
    driverName: "Haris Ali 1",
    vehiclePlate: "AUH-36004",
    merchant: "ENOC Service",
    receiptNo: "EN-77302",
    date: "2026-03-03",
    amount: 163.2,
    category: "FUEL",
    purpose: "Fuel top-up",
    confidence: 66,
    status: "NEW",
    aiNotes: "Low confidence: plate not detected on receipt text.",
    attachmentName: "wa_fuel_0303_enoc.jpg",
    attachmentUrl: buildReceiptPreviewSvg("ENOC Service", 163.2, "2026-03-03", "EN-77302"),
    attachmentSource: "WHATSAPP",
  },
];

const initialReportJobs: ReportJob[] = [
  {
    key: "r-1",
    name: "LES Submission Reconciliation",
    period: "03 Mar 2026",
    generatedAt: "03 Mar, 09:58 AM",
    status: "READY",
  },
  {
    key: "r-2",
    name: "Platform Import Exceptions",
    period: "03 Mar 2026",
    generatedAt: "03 Mar, 09:44 AM",
    status: "READY",
  },
];

const lesSubmissionStages = [
  "Validating ready trips",
  "Refreshing LES authentication token",
  "Submitting trips in batches",
  "Finalizing reconciliation data",
] as const;

const lesLikelyFailureReasonsCatalog = [
  "Driver profile is missing mandatory LES fields.",
  "Vehicle data is incomplete for LES payload.",
  "Pickup time format is invalid for LES.",
  "Missing mandatory fallback identity fields.",
  "LES request timeout while saving batch.",
] as const;

const queueIssueCatalog = [
  { field: "Driver Emirates ID", issue: "Required value missing" },
  { field: "Vehicle plate code", issue: "Invalid format for LES" },
  { field: "Pickup timestamp", issue: "Time zone conversion failed" },
  { field: "Trip fare", issue: "Fare field is empty" },
  { field: "Drop-off zone", issue: "Code does not match LES master list" },
] as const;

const queueDriverNames = [
  "Muhammad Zubair",
  "Ayub",
  "Muhammad Naeem",
  "Qasim Ali Hussain",
  "Muhammad Nawaz",
  "Hasnain Javed",
] as const;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

const getNextRunFromSchedule = (schedule: AutomationSchedule, base: Date) => {
  const minutes = schedule === "15_MIN" ? 15 : schedule === "30_MIN" ? 30 : 60;
  return new Date(base.getTime() + minutes * 60 * 1000);
};

const readConnectorPreferences = (): ConnectorPreferences | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONNECTOR_PREFS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConnectorPreferences;
    if (!parsed.modes || !parsed.authMethods) return null;
    return parsed;
  } catch {
    return null;
  }
};

const buildFailedTripQueue = (rows: PlatformRow[]): FailedTrip[] => {
  const queue: FailedTrip[] = [];
  let globalIndex = 1;

  rows.forEach((row) => {
    const capped = Math.min(row.failed, 18);
    for (let index = 0; index < capped; index += 1) {
      const issue = queueIssueCatalog[(globalIndex + index) % queueIssueCatalog.length];
      const driver = queueDriverNames[(globalIndex + index) % queueDriverNames.length];
      queue.push({
        key: `${row.platform}-${globalIndex}`,
        platform: row.platform,
        tripRef: `${row.platform.slice(0, 2)}-${100000 + globalIndex}`,
        driverName: driver,
        vehicleCode: `AUH-${35000 + globalIndex}`,
        field: issue.field,
        issue: issue.issue,
        lastAttempt: "Pending",
      });
      globalIndex += 1;
    }
  });

  return queue;
};

const PlatformBrand = ({ platform }: { platform: Platform }) => (
  <Space size={8}>
    <img src={platformLogoMap[platform]} alt={`${platformNameMap[platform]} logo`} className="platform-logo" />
    <Typography.Text>{platformNameMap[platform]}</Typography.Text>
  </Space>
);

const App = () => {
  const savedPreferences = readConnectorPreferences();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuKey>("dashboard");
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [activeLesTab, setActiveLesTab] = useState<LesTabKey>("overview");
  const [activeFinanceTab, setActiveFinanceTab] = useState<FinanceTabKey>("earnings");

  const [uberMode, setUberMode] = useState<Mode>(savedPreferences?.modes.UBER ?? defaultModes.UBER);
  const [careemMode, setCareemMode] = useState<Mode>(savedPreferences?.modes.CAREEM ?? defaultModes.CAREEM);
  const [indriveMode, setIndriveMode] = useState<Mode>(savedPreferences?.modes.INDRIVE ?? defaultModes.INDRIVE);
  const [authMethods, setAuthMethods] = useState<Record<Platform, AuthMethod>>(
    savedPreferences?.authMethods ?? defaultAuthMethods,
  );

  const [platformStats, setPlatformStats] = useState<PlatformRow[]>(initialPlatformRows);
  const [ingestRuns, setIngestRuns] = useState<IngestRun[]>(initialIngestRuns);
  const [failedTrips, setFailedTrips] = useState<FailedTrip[]>(buildFailedTripQueue(initialPlatformRows));
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionHistoryRow[]>(initialSubmissionHistory);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>(initialFleetVehicles);
  const [driverCompliance, setDriverCompliance] = useState<DriverCompliance[]>(initialDriverCompliance);
  const [driverPayouts] = useState<DriverPayout[]>(initialDriverPayouts);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(initialExpenses);
  const [whatsAppReceipts, setWhatsAppReceipts] = useState<WhatsAppReceipt[]>(initialWhatsAppReceipts);
  const [reportJobs, setReportJobs] = useState<ReportJob[]>(initialReportJobs);

  const [testingConnections, setTestingConnections] = useState<Record<Platform, boolean>>({
    UBER: false,
    CAREEM: false,
    INDRIVE: false,
  });
  const [testingLesConnection, setTestingLesConnection] = useState(false);
  const [platformConnectionHealth, setPlatformConnectionHealth] = useState<Record<Platform, ConnectionHealth>>({
    UBER: "CONNECTED",
    CAREEM: "NOT_TESTED",
    INDRIVE: "NOT_TESTED",
  });
  const [lesConnectionHealth, setLesConnectionHealth] = useState<ConnectionHealth>("CONNECTED");

  const [autoSubmitEnabled, setAutoSubmitEnabled] = useState(false);
  const [autoSubmitRunning, setAutoSubmitRunning] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState<AutomationSchedule>("30_MIN");
  const [autoFailureOnlyAlerts, setAutoFailureOnlyAlerts] = useState(true);
  const [autoLastRunText, setAutoLastRunText] = useState("Not run yet");
  const [autoNextRunText, setAutoNextRunText] = useState("Not scheduled");

  const [syncRunning, setSyncRunning] = useState(false);
  const [validatingTrips, setValidatingTrips] = useState(false);
  const [retryingTripKey, setRetryingTripKey] = useState<string | null>(null);
  const [dailyDigestEnabled, setDailyDigestEnabled] = useState(true);
  const [smsAlertEnabled, setSmsAlertEnabled] = useState(true);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedVehicleKey, setSelectedVehicleKey] = useState<string | null>(null);
  const [selectedDriverKey, setSelectedDriverKey] = useState<string | null>(null);
  const [selectedExpenseKey, setSelectedExpenseKey] = useState<string | null>(null);
  const [selectedWhatsAppReceiptKey, setSelectedWhatsAppReceiptKey] = useState<string | null>(null);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [aiReviewingReceiptKey, setAiReviewingReceiptKey] = useState<string | null>(null);
  const [receiptActionLoadingKey, setReceiptActionLoadingKey] = useState<string | null>(null);

  const [vehicleSearchText, setVehicleSearchText] = useState("");
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState<"ALL" | FleetVehicle["status"]>("ALL");
  const [vehicleOperationalFilter, setVehicleOperationalFilter] = useState<"ALL" | FleetVehicle["operationalStatus"]>("ALL");

  const [driverSearchText, setDriverSearchText] = useState("");
  const [driverStatusFilter, setDriverStatusFilter] = useState<"ALL" | DriverCompliance["status"]>("ALL");
  const [driverComplianceFilter, setDriverComplianceFilter] = useState<"ALL" | DriverCompliance["compliance"]>("ALL");

  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<"ALL" | ExpenseCategory>("ALL");
  const [expenseVehicleFilter, setExpenseVehicleFilter] = useState<"ALL" | string>("ALL");
  const [expenseSearchText, setExpenseSearchText] = useState("");
  const [whatsAppStatusFilter, setWhatsAppStatusFilter] = useState<"ALL" | WhatsAppReceiptStatus>("ALL");
  const [whatsAppSearchText, setWhatsAppSearchText] = useState("");

  const [captainSearchText, setCaptainSearchText] = useState("");
  const [captainStatusFilter, setCaptainStatusFilter] = useState<"ALL" | DriverCompliance["status"]>("ALL");

  const [reportDriverStatusFilter, setReportDriverStatusFilter] = useState<"ALL" | DriverCompliance["status"]>("ALL");
  const [reportVehicleOperationalFilter, setReportVehicleOperationalFilter] = useState<"ALL" | FleetVehicle["operationalStatus"]>("ALL");

  const [lesModalOpen, setLesModalOpen] = useState(false);
  const [lesSubmitting, setLesSubmitting] = useState(false);
  const [lesProgress, setLesProgress] = useState(0);
  const [lesCurrentStage, setLesCurrentStage] = useState(0);
  const [lesFailedStageIndex, setLesFailedStageIndex] = useState<number | null>(null);
  const [lesSubmissionLog, setLesSubmissionLog] = useState<string[]>([]);
  const [lesSummary, setLesSummary] = useState({
    ready: 0,
    submitted: 0,
    failed: 0,
  });
  const [lesLikelyFailureReasons, setLesLikelyFailureReasons] = useState<Array<{ reason: string; count: number }>>(
    [],
  );

  const [loginForm] = Form.useForm<LoginFormValues>();
  const [uberForm] = Form.useForm<ConnectorFormValues>();
  const [careemForm] = Form.useForm<ConnectorFormValues>();
  const [indriveForm] = Form.useForm<ConnectorFormValues>();
  const [lesConnectorForm] = Form.useForm<LesConnectorFormValues>();
  const [companyForm] = Form.useForm<CompanyFormValues>();
  const [expenseForm] = Form.useForm<ExpenseFormValues>();
  const [vehicleForm] = Form.useForm<VehicleFormValues>();
  const [driverForm] = Form.useForm<DriverFormValues>();
  const [api, contextHolder] = message.useMessage();

  const selectedModes: Record<Platform, Mode> = {
    UBER: uberMode,
    CAREEM: careemMode,
    INDRIVE: indriveMode,
  };

  const platformRowsWithSelectedMode: PlatformRow[] = platformStats.map((row) => ({
    ...row,
    mode: selectedModes[row.platform] === "API" ? "API Connector" : "Export Upload",
  }));

  const apiEnabledPlatforms = (Object.keys(selectedModes) as Platform[]).filter(
    (platform) => selectedModes[platform] === "API",
  );

  const allApiPlatformsConnected =
    apiEnabledPlatforms.length > 0 &&
    apiEnabledPlatforms.every((platform) => platformConnectionHealth[platform] === "CONNECTED");

  const automationReady = lesConnectionHealth === "CONNECTED" && allApiPlatformsConnected;
  const hasLesConnectionIssue =
    lesConnectionHealth !== "CONNECTED" || (Object.values(platformConnectionHealth) as ConnectionHealth[]).some((health) => health === "FAILED");

  const menuItems: MenuProps["items"] = useMemo(
    () => [
      { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
      { key: "vehicles", icon: <CarOutlined />, label: "Vehicles" },
      { key: "drivers", icon: <UserOutlined />, label: "Drivers" },
      { key: "finance", icon: <DollarOutlined />, label: "Money" },
      { key: "reports", icon: <BarChartOutlined />, label: "Reports" },
      {
        key: "les",
        icon: (
          <span className="les-icon-with-dot">
            <SafetyOutlined />
            <span
              className={`les-nav-dot ${hasLesConnectionIssue ? "les-nav-dot--error" : "les-nav-dot--ok"}`}
              aria-label={hasLesConnectionIssue ? "LES has connection issues" : "LES healthy"}
            />
          </span>
        ),
        label: "LES Center",
      },
      { key: "settings", icon: <SettingOutlined />, label: "Settings" },
    ],
    [hasLesConnectionIssue],
  );

  const dashboardTotals = platformRowsWithSelectedMode.reduce(
    (acc, row) => ({
      imported: acc.imported + row.todayImported,
      ready: acc.ready + row.readyForLes,
      failed: acc.failed + row.failed,
    }),
    { imported: 0, ready: 0, failed: 0 },
  );

  const fleetStats = useMemo(() => {
    const onTrip = fleetVehicles.filter((item) => item.status === "ON_TRIP").length;
    const idle = fleetVehicles.filter((item) => item.status === "IDLE").length;
    const offline = fleetVehicles.filter((item) => item.status === "OFFLINE").length;
    const offService = fleetVehicles.filter((item) => item.operationalStatus === "OFF_SERVICE").length;
    return {
      total: fleetVehicles.length,
      onTrip,
      idle,
      offline,
      offService,
    };
  }, [fleetVehicles]);

  const complianceStats = useMemo(() => {
    const valid = driverCompliance.filter((item) => item.compliance === "VALID").length;
    const expiring = driverCompliance.filter((item) => item.compliance === "EXPIRING_SOON").length;
    const missing = driverCompliance.filter((item) => item.compliance === "MISSING").length;
    return { valid, expiring, missing };
  }, [driverCompliance]);

  const financeTotals = useMemo(() => {
    const totalEarnings = driverPayouts.reduce((sum, item) => sum + item.totalEarnings, 0);
    const refundsExpenses = driverPayouts.reduce((sum, item) => sum + item.refundsExpenses, 0);
    const payouts = driverPayouts.reduce((sum, item) => sum + item.payouts, 0);
    const operatingExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const net = driverPayouts.reduce((sum, item) => sum + item.netEarnings, 0);
    return {
      totalEarnings,
      refundsExpenses,
      payouts,
      operatingExpenses,
      netAfterOps: net - operatingExpenses,
    };
  }, [driverPayouts, expenses]);

  const filteredVehicles = useMemo(
    () =>
      fleetVehicles.filter((vehicle) => {
        const search = vehicleSearchText.trim().toLowerCase();
        const searchMatch =
          !search ||
          vehicle.plate.toLowerCase().includes(search) ||
          vehicle.model.toLowerCase().includes(search) ||
          vehicle.captain.toLowerCase().includes(search);
        const statusMatch = vehicleStatusFilter === "ALL" || vehicle.status === vehicleStatusFilter;
        const operationalMatch =
          vehicleOperationalFilter === "ALL" || vehicle.operationalStatus === vehicleOperationalFilter;
        return searchMatch && statusMatch && operationalMatch;
      }),
    [fleetVehicles, vehicleSearchText, vehicleStatusFilter, vehicleOperationalFilter],
  );

  const filteredDrivers = useMemo(
    () =>
      driverCompliance.filter((driver) => {
        const search = driverSearchText.trim().toLowerCase();
        const searchMatch =
          !search ||
          driver.name.toLowerCase().includes(search) ||
          driver.emiratesId.toLowerCase().includes(search) ||
          driver.assignedPlate.toLowerCase().includes(search);
        const statusMatch = driverStatusFilter === "ALL" || driver.status === driverStatusFilter;
        const complianceMatch =
          driverComplianceFilter === "ALL" || driver.compliance === driverComplianceFilter;
        return searchMatch && statusMatch && complianceMatch;
      }),
    [driverCompliance, driverSearchText, driverStatusFilter, driverComplianceFilter],
  );

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const search = expenseSearchText.trim().toLowerCase();
        const searchMatch =
          !search ||
          expense.vehiclePlate.toLowerCase().includes(search) ||
          (expense.driverName ?? "").toLowerCase().includes(search) ||
          expense.notes.toLowerCase().includes(search);
        const categoryMatch = expenseCategoryFilter === "ALL" || expense.category === expenseCategoryFilter;
        const vehicleMatch = expenseVehicleFilter === "ALL" || expense.vehiclePlate === expenseVehicleFilter;
        return searchMatch && categoryMatch && vehicleMatch;
      }),
    [expenses, expenseSearchText, expenseCategoryFilter, expenseVehicleFilter],
  );

  const filteredWhatsAppReceipts = useMemo(
    () =>
      whatsAppReceipts.filter((receipt) => {
        const search = whatsAppSearchText.trim().toLowerCase();
        const searchMatch =
          !search ||
          receipt.driverName.toLowerCase().includes(search) ||
          receipt.vehiclePlate.toLowerCase().includes(search) ||
          receipt.merchant.toLowerCase().includes(search) ||
          receipt.driverPhone.toLowerCase().includes(search) ||
          receipt.receiptNo.toLowerCase().includes(search);
        const statusMatch = whatsAppStatusFilter === "ALL" || receipt.status === whatsAppStatusFilter;
        return searchMatch && statusMatch;
      }),
    [whatsAppReceipts, whatsAppSearchText, whatsAppStatusFilter],
  );

  const whatsAppInboxStats = useMemo(
    () => ({
      total: whatsAppReceipts.length,
      pending: whatsAppReceipts.filter((receipt) => receipt.status === "NEW").length,
      reviewed: whatsAppReceipts.filter((receipt) => receipt.status === "AI_REVIEWED").length,
      approved: whatsAppReceipts.filter((receipt) => receipt.status === "APPROVED").length,
      rejected: whatsAppReceipts.filter((receipt) => receipt.status === "REJECTED").length,
    }),
    [whatsAppReceipts],
  );

  const selectedWhatsAppReceipt = useMemo(
    () => whatsAppReceipts.find((receipt) => receipt.key === selectedWhatsAppReceiptKey) ?? null,
    [whatsAppReceipts, selectedWhatsAppReceiptKey],
  );

  const captainEarningsRows = useMemo<CaptainEarningsRow[]>(
    () =>
      driverPayouts.map((payout) => {
        const driver = driverCompliance.find((item) => item.name === payout.driver);
        return {
          key: payout.key,
          driver: payout.driver,
          status: driver?.status ?? "ACTIVE",
          assignedPlate: driver?.assignedPlate ?? "-",
          totalEarnings: payout.totalEarnings,
          refundsExpenses: payout.refundsExpenses,
          payouts: payout.payouts,
          netEarnings: payout.netEarnings,
        };
      }),
    [driverPayouts, driverCompliance],
  );

  const filteredCaptainEarnings = useMemo(
    () =>
      captainEarningsRows.filter((row) => {
        const search = captainSearchText.trim().toLowerCase();
        const searchMatch =
          !search ||
          row.driver.toLowerCase().includes(search) ||
          row.assignedPlate.toLowerCase().includes(search);
        const statusMatch = captainStatusFilter === "ALL" || row.status === captainStatusFilter;
        return searchMatch && statusMatch;
      }),
    [captainEarningsRows, captainSearchText, captainStatusFilter],
  );

  const driverPerformanceRows = useMemo(
    () =>
      driverCompliance
        .map((driver) => {
          const payout = driverPayouts.find((item) => item.driver === driver.name);
          return {
            key: `perf-driver-${driver.key}`,
            driver: driver.name,
            status: driver.status,
            assignedPlate: driver.assignedPlate,
            trips: driver.completedTrips,
            acceptanceRate: driver.acceptanceRate,
            onlineHours: driver.onlineHours,
            cancellationRate: driver.cancellationRate,
            netEarnings: payout?.netEarnings ?? 0,
          };
        })
        .filter((row) => reportDriverStatusFilter === "ALL" || row.status === reportDriverStatusFilter),
    [driverCompliance, driverPayouts, reportDriverStatusFilter],
  );

  const vehiclePerformanceRows = useMemo(
    () =>
      fleetVehicles
        .map((vehicle) => ({
          key: `perf-vehicle-${vehicle.key}`,
          plate: vehicle.plate,
          model: `${vehicle.year} ${vehicle.model}`,
          captain: vehicle.captain,
          operationalStatus: vehicle.operationalStatus,
          onRoadHours: vehicle.onRoadHours,
          offRoadHours: vehicle.offRoadHours,
          completedTrips: vehicle.completedTrips,
          utilizationPct: vehicle.utilizationPct,
        }))
        .filter((row) => reportVehicleOperationalFilter === "ALL" || row.operationalStatus === reportVehicleOperationalFilter),
    [fleetVehicles, reportVehicleOperationalFilter],
  );

  const unresolvedFailedCount = failedTrips.length;

  useEffect(() => {
    const payload: ConnectorPreferences = {
      modes: selectedModes,
      authMethods,
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CONNECTOR_PREFS_STORAGE_KEY, JSON.stringify(payload));
    }
  }, [selectedModes, authMethods]);

  useEffect(() => {
    setFailedTrips(buildFailedTripQueue(platformStats));
  }, [platformStats]);

  const connectionStatusTag = (status: ConnectionHealth) => {
    if (status === "CONNECTED") return <Tag color="success">Connected</Tag>;
    if (status === "FAILED") return <Tag color="error">Connection Failed</Tag>;
    return <Tag>Not Tested</Tag>;
  };

  const setAuthMethodForPlatform = (platform: Platform, method: AuthMethod) => {
    setAuthMethods((previous) => ({
      ...previous,
      [platform]: method,
    }));
  };

  const getFormForPlatform = (platform: Platform) => {
    if (platform === "UBER") return uberForm;
    if (platform === "CAREEM") return careemForm;
    return indriveForm;
  };

  const resetAppToDefaults = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CONNECTOR_PREFS_STORAGE_KEY);
    }

    setActiveMenu("dashboard");
    setNavCollapsed(false);
    setActiveLesTab("overview");
    setActiveFinanceTab("earnings");
    setUberMode(defaultModes.UBER);
    setCareemMode(defaultModes.CAREEM);
    setIndriveMode(defaultModes.INDRIVE);
    setAuthMethods(defaultAuthMethods);

    setPlatformStats(initialPlatformRows.map((row) => ({ ...row })));
    setIngestRuns(initialIngestRuns.map((row) => ({ ...row })));
    setSubmissionHistory(initialSubmissionHistory.map((row) => ({ ...row })));
    setReportJobs(initialReportJobs.map((row) => ({ ...row })));
    setExpenses(initialExpenses.map((row) => ({ ...row })));
    setWhatsAppReceipts(initialWhatsAppReceipts.map((row) => ({ ...row })));
    setFleetVehicles(initialFleetVehicles.map((row) => ({ ...row })));
    setDriverCompliance(initialDriverCompliance.map((row) => ({ ...row })));

    setTestingConnections({
      UBER: false,
      CAREEM: false,
      INDRIVE: false,
    });
    setTestingLesConnection(false);

    setPlatformConnectionHealth({
      UBER: "CONNECTED",
      CAREEM: "NOT_TESTED",
      INDRIVE: "NOT_TESTED",
    });
    setLesConnectionHealth("CONNECTED");

    setAutoSubmitEnabled(false);
    setAutoSubmitRunning(false);
    setAutoSchedule("30_MIN");
    setAutoFailureOnlyAlerts(true);
    setAutoLastRunText("Not run yet");
    setAutoNextRunText("Not scheduled");

    setSyncRunning(false);
    setValidatingTrips(false);
    setRetryingTripKey(null);
    setDailyDigestEnabled(true);
    setSmsAlertEnabled(true);
    setVehicleModalOpen(false);
    setDriverModalOpen(false);
    setExpenseModalOpen(false);
    setWhatsAppModalOpen(false);
    setSelectedVehicleKey(null);
    setSelectedDriverKey(null);
    setSelectedExpenseKey(null);
    setSelectedWhatsAppReceiptKey(null);
    setAiReviewingReceiptKey(null);
    setReceiptActionLoadingKey(null);
    setVehicleSearchText("");
    setVehicleStatusFilter("ALL");
    setVehicleOperationalFilter("ALL");
    setDriverSearchText("");
    setDriverStatusFilter("ALL");
    setDriverComplianceFilter("ALL");
    setExpenseCategoryFilter("ALL");
    setExpenseVehicleFilter("ALL");
    setExpenseSearchText("");
    setWhatsAppStatusFilter("ALL");
    setWhatsAppSearchText("");
    setCaptainSearchText("");
    setCaptainStatusFilter("ALL");
    setReportDriverStatusFilter("ALL");
    setReportVehicleOperationalFilter("ALL");

    setLesModalOpen(false);
    setLesSubmitting(false);
    setLesProgress(0);
    setLesCurrentStage(0);
    setLesFailedStageIndex(null);
    setLesSubmissionLog([]);
    setLesSummary({ ready: 0, submitted: 0, failed: 0 });
    setLesLikelyFailureReasons([]);

    loginForm.resetFields();
    uberForm.resetFields();
    careemForm.resetFields();
    indriveForm.resetFields();
    lesConnectorForm.resetFields();
    companyForm.resetFields();
    expenseForm.resetFields();
    vehicleForm.resetFields();
    driverForm.resetFields();
    uberForm.setFieldsValue({ authMethod: defaultAuthMethods.UBER });
    careemForm.setFieldsValue({ authMethod: defaultAuthMethods.CAREEM });
    indriveForm.setFieldsValue({ authMethod: defaultAuthMethods.INDRIVE });
  };

  const setModeForPlatform = (platform: Platform, mode: Mode) => {
    if (platform === "UBER") setUberMode(mode);
    if (platform === "CAREEM") setCareemMode(mode);
    if (platform === "INDRIVE") setIndriveMode(mode);

    setPlatformConnectionHealth((previous) => ({
      ...previous,
      [platform]: "NOT_TESTED",
    }));

    api.success(`${platformNameMap[platform]} data mode set to ${mode === "API" ? "API Connector" : "Export Upload"}.`);
  };

  const onSaveConnector = async (platform: Platform) => {
    const form = getFormForPlatform(platform);
    try {
      await form.validateFields();
      setPlatformConnectionHealth((previous) => ({
        ...previous,
        [platform]: "NOT_TESTED",
      }));
      api.success(`${platformNameMap[platform]} connector saved. Test connection to verify access.`);
    } catch {
      api.error(`Please fill all required ${platformNameMap[platform]} connector fields.`);
    }
  };

  const onTestConnection = async (platform: Platform) => {
    const form = getFormForPlatform(platform);
    try {
      await form.validateFields();
      setTestingConnections((previous) => ({ ...previous, [platform]: true }));

      const simulatedLatencyMs = 700 + Math.floor(Math.random() * 1200);
      await wait(simulatedLatencyMs);
      const isSuccess = Math.random() < 0.65;

      if (isSuccess) {
        setPlatformConnectionHealth((previous) => ({ ...previous, [platform]: "CONNECTED" }));
        api.success(`${platformNameMap[platform]} connection test passed (${simulatedLatencyMs} ms).`);
      } else {
        setPlatformConnectionHealth((previous) => ({ ...previous, [platform]: "FAILED" }));
        const failureReasons = [
          "Authentication failed (invalid credential or token expired).",
          "Account access denied (insufficient scope/permissions).",
          "Rate limit reached. Please retry shortly.",
          "Network timeout while contacting provider API.",
        ];
        const randomReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
        api.error(`${platformNameMap[platform]} connection test failed: ${randomReason}`);
      }
    } catch {
      setPlatformConnectionHealth((previous) => ({ ...previous, [platform]: "FAILED" }));
      api.error(`Please complete required ${platformNameMap[platform]} fields before testing.`);
    } finally {
      setTestingConnections((previous) => ({ ...previous, [platform]: false }));
    }
  };

  const onSaveLesConnector = async () => {
    try {
      await lesConnectorForm.validateFields();
      setLesConnectionHealth("NOT_TESTED");
      api.success("LES connector saved. Test LES connection to continue.");
    } catch {
      api.error("Please fill all required LES connector fields.");
    }
  };

  const onTestLesConnection = async () => {
    try {
      await lesConnectorForm.validateFields();
      setTestingLesConnection(true);
      const simulatedLatencyMs = 700 + Math.floor(Math.random() * 1200);
      await wait(simulatedLatencyMs);
      const isSuccess = Math.random() < 0.8;

      if (isSuccess) {
        setLesConnectionHealth("CONNECTED");
        api.success(`LES connection test passed (${simulatedLatencyMs} ms).`);
      } else {
        setLesConnectionHealth("FAILED");
        api.error("LES connection test failed: authentication rejected by LES.");
      }
    } catch {
      setLesConnectionHealth("FAILED");
      api.error("Please complete required LES fields before testing.");
    } finally {
      setTestingLesConnection(false);
    }
  };

  const simulateManualUpload = (platform: Platform, fileName: string) => {
    const imported = 40 + Math.floor(Math.random() * 90);
    const failed = Math.floor(imported * (0.02 + Math.random() * 0.1));
    const ready = Math.max(imported - failed, 0);
    const runAt = formatDateTime(new Date());

    const newRun: IngestRun = {
      key: `ir-${Date.now()}-${platform}`,
      platform,
      source: "UPLOAD",
      fetched: imported,
      mapped: ready,
      failed,
      status: failed > 0 ? "PARTIAL" : "SUCCESS",
      runAt,
    };

    setIngestRuns((previous) => [newRun, ...previous].slice(0, 30));

    setPlatformStats((previous) =>
      previous.map((row) => {
        if (row.platform !== platform) return row;
        const nextFailed = row.failed + failed;
        return {
          ...row,
          todayImported: row.todayImported + imported,
          readyForLes: row.readyForLes + ready,
          failed: nextFailed,
          status: nextFailed > 0 ? "attention" : "good",
        };
      }),
    );

    api.success(`${platformNameMap[platform]} upload received (${fileName}). ${ready} trips ready for LES.`);
  };

  const uploadProps = (platform: Platform): UploadProps => ({
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) => {
      simulateManualUpload(platform, file.name);
      return false;
    },
  });

  const runIngestionNow = async () => {
    if (syncRunning) return;
    setSyncRunning(true);

    await wait(1000 + Math.floor(Math.random() * 400));

    const newRuns: IngestRun[] = [];
    setPlatformStats((previous) =>
      previous.map((row) => {
        const mode = selectedModes[row.platform];

        if (mode !== "API") {
          newRuns.push({
            key: `ir-${Date.now()}-${row.platform}-wait`,
            platform: row.platform,
            source: "UPLOAD",
            fetched: 0,
            mapped: 0,
            failed: 0,
            status: "WAITING",
            runAt: formatDateTime(new Date()),
          });
          return row;
        }

        const fetched = 50 + Math.floor(Math.random() * 120);
        const failed = Math.floor(fetched * (0.01 + Math.random() * 0.08));
        const mapped = fetched - failed;
        const nextFailed = row.failed + failed;

        newRuns.push({
          key: `ir-${Date.now()}-${row.platform}`,
          platform: row.platform,
          source: "API",
          fetched,
          mapped,
          failed,
          status: failed > 0 ? "PARTIAL" : "SUCCESS",
          runAt: formatDateTime(new Date()),
        });

        return {
          ...row,
          todayImported: row.todayImported + fetched,
          readyForLes: row.readyForLes + mapped,
          failed: nextFailed,
          status: nextFailed > 0 ? "attention" : "good",
        };
      }),
    );

    setIngestRuns((previous) => [...newRuns, ...previous].slice(0, 40));
    setSyncRunning(false);
    api.success("Ingestion cycle completed. Review ready and failed counts before LES submission.");
  };

  const validateImportedTrips = async () => {
    if (validatingTrips) return;
    setValidatingTrips(true);

    await wait(800 + Math.floor(Math.random() * 500));

    let totalResolved = 0;
    setPlatformStats((previous) =>
      previous.map((row) => {
        const resolved = row.failed > 0 ? Math.min(row.failed, Math.max(1, Math.floor(row.failed * (0.25 + Math.random() * 0.4)))) : 0;
        totalResolved += resolved;
        const nextFailed = Math.max(row.failed - resolved, 0);

        return {
          ...row,
          readyForLes: row.readyForLes + resolved,
          failed: nextFailed,
          status: nextFailed > 0 ? "attention" : "good",
        };
      }),
    );

    setValidatingTrips(false);
    if (totalResolved > 0) {
      api.success(`${totalResolved} trips were auto-corrected and moved to ready queue.`);
    } else {
      api.info("No corrections were needed in this validation run.");
    }
  };

  const retrySingleFailedTrip = async (trip: FailedTrip) => {
    if (retryingTripKey) return;

    setRetryingTripKey(trip.key);
    await wait(600 + Math.floor(Math.random() * 500));
    const success = Math.random() < 0.72;

    if (success) {
      setPlatformStats((previous) =>
        previous.map((row) => {
          if (row.platform !== trip.platform) return row;
          const nextFailed = Math.max(row.failed - 1, 0);
          return {
            ...row,
            failed: nextFailed,
            status: nextFailed > 0 ? "attention" : "good",
          };
        }),
      );
      api.success(`${trip.tripRef} fixed and submitted successfully.`);
    } else {
      const followupReasons = [
        "Passenger identity field is still incomplete.",
        "Trip timestamp still invalid for LES parser.",
        "Vehicle mapping was rejected by LES.",
      ];
      const reason = followupReasons[Math.floor(Math.random() * followupReasons.length)];
      setFailedTrips((previous) =>
        previous.map((item) =>
          item.key === trip.key
            ? {
                ...item,
                lastAttempt: `${formatDateTime(new Date())} - ${reason}`,
              }
            : item,
        ),
      );
      api.error(`${trip.tripRef} retry failed: ${reason}`);
    }

    setRetryingTripKey(null);
  };

  const runLesSubmissionSimulation = async (
    scope: LesRunScope = { type: "ready-all" },
  ): Promise<{ ready: number; submitted: number; failed: number } | null> => {
    if (lesSubmitting) return null;

    const scopedRows = platformRowsWithSelectedMode
      .filter((row) => {
        if (scope.type === "ready-all") return row.readyForLes > 0;
        if (scope.type === "failed-all") return row.failed > 0;
        return row.platform === scope.platform && row.failed > 0;
      })
      .map((row) => ({
        platform: row.platform,
        trips: scope.type === "ready-all" ? row.readyForLes : row.failed,
      }));

    const totalReady = scopedRows.reduce((sum, row) => sum + row.trips, 0);
    if (totalReady <= 0) {
      api.info(scope.type === "ready-all" ? "No ready trips available to submit." : "No failed trips available to resubmit.");
      return null;
    }

    const startedAt = new Date();
    const runLabel =
      scope.type === "ready-all"
        ? `Starting LES submission for ${totalReady} ready trips...`
        : scope.type === "failed-all"
          ? `Starting LES resubmission for ${totalReady} failed trips...`
          : `Starting LES resubmission for ${platformNameMap[scope.platform]} failed trips (${totalReady})...`;

    const scopeLabel =
      scope.type === "ready-all"
        ? "Ready trips (all platforms)"
        : scope.type === "failed-all"
          ? "Failed trips (all platforms)"
          : `Failed trips (${platformNameMap[scope.platform]})`;

    const addSubmissionHistory = (
      submitted: number,
      failed: number,
      status: SubmissionHistoryRow["status"],
    ) => {
      const endedAt = new Date();
      const durationSec = Math.max(Math.round((endedAt.getTime() - startedAt.getTime()) / 1000), 1);
      setSubmissionHistory((previous) => [
        {
          key: `les-${Date.now()}`,
          startedAt: formatDateTime(startedAt),
          scope: scopeLabel,
          ready: totalReady,
          submitted,
          failed,
          durationSec,
          status,
        },
        ...previous,
      ].slice(0, 35));
    };

    setLesModalOpen(true);
    setLesSubmitting(true);
    setLesProgress(0);
    setLesCurrentStage(0);
    setLesFailedStageIndex(null);
    setLesSubmissionLog([runLabel]);
    setLesSummary({
      ready: totalReady,
      submitted: 0,
      failed: 0,
    });
    setLesLikelyFailureReasons([]);

    setLesCurrentStage(0);
    setLesProgress(12);
    setLesSubmissionLog((previous) => [...previous, "Stage 1/4: Validation completed."]);
    await wait(700);

    setLesCurrentStage(1);
    setLesProgress(30);
    setLesSubmissionLog((previous) => [...previous, "Stage 2/4: LES token refreshed."]);
    await wait(800);

    const tokenFailure = Math.random() < 0.08;
    if (tokenFailure) {
      setLesFailedStageIndex(1);
      setLesSubmitting(false);
      setLesSummary({
        ready: totalReady,
        submitted: 0,
        failed: totalReady,
      });
      setLesLikelyFailureReasons([{ reason: "LES authentication failed (token issue).", count: totalReady }]);
      setLesSubmissionLog((previous) => [...previous, "Submission stopped: LES authentication failed."]);
      addSubmissionHistory(0, totalReady, "FAILED");
      api.error("LES submission failed at authentication stage. Please retry.");
      return { ready: totalReady, submitted: 0, failed: totalReady };
    }

    setLesCurrentStage(2);
    setLesProgress(40);

    const batchCount = 5;
    const failureRate = 0.01 + Math.random() * 0.05;
    let processed = 0;
    let submitted = 0;
    let failed = 0;
    const reasonCounter = new Map<string, number>();

    for (let batch = 1; batch <= batchCount; batch += 1) {
      await wait(500 + Math.floor(Math.random() * 500));

      const remaining = totalReady - processed;
      const batchSize = batch === batchCount ? remaining : Math.max(1, Math.round(totalReady / batchCount));
      const actualBatch = Math.min(batchSize, remaining);
      const batchFailed = Math.min(
        actualBatch,
        Math.round(actualBatch * failureRate * (0.7 + Math.random() * 0.6)),
      );
      const batchSubmitted = actualBatch - batchFailed;

      processed += actualBatch;
      submitted += batchSubmitted;
      failed += batchFailed;

      setLesSummary({
        ready: totalReady,
        submitted,
        failed,
      });

      if (batchFailed > 0) {
        const failureReason =
          lesLikelyFailureReasonsCatalog[Math.floor(Math.random() * lesLikelyFailureReasonsCatalog.length)];
        reasonCounter.set(failureReason, (reasonCounter.get(failureReason) ?? 0) + batchFailed);
      }

      setLesProgress(40 + Math.round((processed / Math.max(totalReady, 1)) * 45));
      setLesSubmissionLog((previous) => [...previous, `Batch ${batch}/${batchCount}: submitted ${batchSubmitted}, failed ${batchFailed}.`]);
    }

    setLesCurrentStage(3);
    setLesProgress(92);
    setLesSubmissionLog((previous) => [...previous, "Stage 4/4: Reconciliation snapshot generated."]);
    await wait(700);

    setLesProgress(100);
    setLesSubmitting(false);

    const likelyReasons = [...reasonCounter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([reason, count]) => ({ reason, count }));

    setLesLikelyFailureReasons(likelyReasons);

    const distributeFailuresByPlatform = (
      rows: Array<{ platform: Platform; trips: number }>,
      totalFailedTrips: number,
    ) => {
      const totalTrips = rows.reduce((sum, row) => sum + row.trips, 0);
      if (totalFailedTrips <= 0 || totalTrips <= 0) {
        return new Map<Platform, number>(rows.map((row) => [row.platform, 0]));
      }

      const allocations = rows.map((row) => {
        const exact = (row.trips / totalTrips) * totalFailedTrips;
        return {
          platform: row.platform,
          count: Math.floor(exact),
          remainder: exact - Math.floor(exact),
        };
      });

      let remaining = totalFailedTrips - allocations.reduce((sum, row) => sum + row.count, 0);
      allocations.sort((a, b) => b.remainder - a.remainder);

      for (let index = 0; index < allocations.length && remaining > 0; index += 1) {
        allocations[index].count += 1;
        remaining -= 1;
      }

      return new Map<Platform, number>(allocations.map((row) => [row.platform, row.count]));
    };

    const failedByPlatform = distributeFailuresByPlatform(scopedRows, failed);

    setPlatformStats((previous) =>
      previous.map((row) => {
        const targetScope = scopedRows.find((scoped) => scoped.platform === row.platform);
        if (!targetScope) return row;

        const remainingFailedForScope = failedByPlatform.get(row.platform) ?? 0;
        if (scope.type === "ready-all") {
          const nextFailed = row.failed + remainingFailedForScope;
          return {
            ...row,
            readyForLes: Math.max(row.readyForLes - targetScope.trips, 0),
            failed: nextFailed,
            status: nextFailed > 0 ? "attention" : "good",
          };
        }

        return {
          ...row,
          failed: remainingFailedForScope,
          status: remainingFailedForScope > 0 ? "attention" : "good",
        };
      }),
    );

    if (failed > 0) {
      addSubmissionHistory(submitted, failed, "PARTIAL");
      api.warning(`LES submission finished with ${failed} failed trips. Review failed queue.`);
    } else {
      addSubmissionHistory(submitted, failed, "SUCCESS");
      api.success("LES submission finished successfully.");
    }

    return { ready: totalReady, submitted, failed };
  };

  const runAutomationNow = async () => {
    if (autoSubmitRunning) return;
    if (!automationReady) {
      api.error("Automation is not ready. Test LES and all API connectors first.");
      return;
    }

    setAutoSubmitRunning(true);
    try {
      const result = await runLesSubmissionSimulation({ type: "ready-all" });
      if (!result) return;

      const now = new Date();
      const nextRun = getNextRunFromSchedule(autoSchedule, now);
      setAutoLastRunText(`${formatDateTime(now)} (${result.failed > 0 ? "with failures" : "successful"})`);
      setAutoNextRunText(formatDateTime(nextRun));

      if (result.failed > 0 && autoFailureOnlyAlerts) {
        api.warning("Automation run completed with failures. Please review failed queue.");
      }

      if (result.failed === 0 && !autoFailureOnlyAlerts) {
        api.success("Automation run completed successfully.");
      }
    } finally {
      setAutoSubmitRunning(false);
    }
  };

  const onToggleAutoSubmit = (enabled: boolean) => {
    if (enabled && !automationReady) {
      api.error("Complete and test LES plus API connector settings before enabling automation.");
      return;
    }

    setAutoSubmitEnabled(enabled);
    if (enabled) {
      const now = new Date();
      setAutoNextRunText(formatDateTime(getNextRunFromSchedule(autoSchedule, now)));
      api.success("Automation enabled. Daily login is no longer required.");
      return;
    }

    setAutoNextRunText("Not scheduled");
    api.info("Automation paused.");
  };

  const onAutomationScheduleChange = (schedule: AutomationSchedule) => {
    setAutoSchedule(schedule);
    if (autoSubmitEnabled) {
      setAutoNextRunText(formatDateTime(getNextRunFromSchedule(schedule, new Date())));
    }
  };

  const openLesSection = (tab: LesTabKey) => {
    setActiveLesTab(tab);
    setActiveMenu("les");
  };

  const onGenerateReport = async (name: string) => {
    const jobKey = `report-${Date.now()}`;
    const generatedAt = formatDateTime(new Date());

    setReportJobs((previous) => [
      {
        key: jobKey,
        name,
        period: "03 Mar 2026",
        generatedAt,
        status: "GENERATING",
      },
      ...previous,
    ]);

    await wait(900 + Math.floor(Math.random() * 900));

    setReportJobs((previous) =>
      previous.map((job) =>
        job.key === jobKey
          ? {
              ...job,
              status: "READY",
            }
          : job,
      ),
    );

    api.success(`${name} generated.`);
  };

  const openExpenseModalForCreate = () => {
    setSelectedExpenseKey(null);
    expenseForm.resetFields();
    expenseForm.setFieldsValue({
      date: new Date().toISOString().slice(0, 10),
    });
    setExpenseModalOpen(true);
  };

  const openExpenseModalForEdit = (entry: ExpenseEntry) => {
    setSelectedExpenseKey(entry.key);
    expenseForm.setFieldsValue({
      date: entry.date,
      category: entry.category,
      vehiclePlate: entry.vehiclePlate,
      driverName: entry.driverName,
      amount: String(entry.amount),
      notes: entry.notes,
    });
    setExpenseModalOpen(true);
  };

  const onSaveExpense = async () => {
    try {
      const values = await expenseForm.validateFields();
      const amount = Number(values.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        api.error("Enter a valid amount greater than zero.");
        return;
      }

      const entry: ExpenseEntry = {
        key: selectedExpenseKey ?? `e-${Date.now()}`,
        date: values.date ?? new Date().toISOString().slice(0, 10),
        category: values.category ?? "OTHER",
        vehiclePlate: values.vehiclePlate ?? "N/A",
        driverName: values.driverName,
        amount,
        notes: values.notes?.trim() ?? "",
      };

      if (selectedExpenseKey) {
        setExpenses((previous) =>
          previous.map((item) => (item.key === selectedExpenseKey ? entry : item)),
        );
      } else {
        setExpenses((previous) => [entry, ...previous].slice(0, 120));
      }
      setExpenseModalOpen(false);
      setSelectedExpenseKey(null);
      expenseForm.resetFields();
      api.success(selectedExpenseKey ? "Expense updated." : "Expense added to financial ledger.");
    } catch {
      api.error("Please fill all required expense fields.");
    }
  };

  const openWhatsAppReceipt = (receipt: WhatsAppReceipt) => {
    setSelectedWhatsAppReceiptKey(receipt.key);
    setWhatsAppModalOpen(true);
  };

  const attachReceiptToWhatsAppItem = (receiptKey: string, file: File) => {
    const blobUrl = URL.createObjectURL(file);
    setWhatsAppReceipts((previous) =>
      previous.map((receipt) => {
        if (receipt.key !== receiptKey) return receipt;
        if (receipt.attachmentUrl && receipt.attachmentUrl.startsWith("blob:")) {
          URL.revokeObjectURL(receipt.attachmentUrl);
        }
        return {
          ...receipt,
          attachmentName: file.name,
          attachmentUrl: blobUrl,
          attachmentSource: "MANUAL",
        };
      }),
    );
    api.success("Receipt image attached.");
  };

  const whatsAppAttachmentUploadProps = (receiptKey: string): UploadProps => ({
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) => {
      attachReceiptToWhatsAppItem(receiptKey, file as File);
      return false;
    },
  });

  const runAiReviewOnReceipt = async (receiptKey: string) => {
    if (aiReviewingReceiptKey || receiptActionLoadingKey) return;
    setAiReviewingReceiptKey(receiptKey);
    await wait(800 + Math.floor(Math.random() * 800));

    setWhatsAppReceipts((previous) =>
      previous.map((receipt) => {
        if (receipt.key !== receiptKey) return receipt;
        const confidence = Math.min(98, Math.max(58, receipt.confidence + Math.round((Math.random() - 0.2) * 14)));
        const notes =
          confidence >= 88
            ? "AI extracted all required fields with strong match to driver and vehicle."
            : confidence >= 72
              ? "AI extracted core fields. Please verify category or assignment."
              : "Low confidence extraction. Manual verification recommended before approval.";
        return {
          ...receipt,
          confidence,
          status: "AI_REVIEWED",
          aiNotes: notes,
        };
      }),
    );

    setAiReviewingReceiptKey(null);
    api.success("AI review completed for WhatsApp receipt.");
  };

  const approveWhatsAppReceipt = async (receiptKey: string) => {
    if (receiptActionLoadingKey) return;
    setReceiptActionLoadingKey(receiptKey);
    await wait(450 + Math.floor(Math.random() * 350));

    const receiptToApprove = whatsAppReceipts.find((receipt) => receipt.key === receiptKey);
    if (!receiptToApprove) {
      setReceiptActionLoadingKey(null);
      api.error("Receipt not found.");
      return;
    }

    setWhatsAppReceipts((previous) =>
      previous.map((receipt) =>
        receipt.key === receiptKey
          ? {
              ...receipt,
              status: "APPROVED",
            }
          : receipt,
      ),
    );

    setExpenses((previous) => {
      const existing = previous.find((item) => item.notes.includes(`WA:${receiptToApprove.receiptNo}`));
      if (existing) return previous;
      return [
        {
          key: `e-wa-${Date.now()}`,
          date: receiptToApprove.date,
          category: receiptToApprove.category,
          vehiclePlate: receiptToApprove.vehiclePlate,
          driverName: receiptToApprove.driverName,
          amount: receiptToApprove.amount,
          notes: `${receiptToApprove.purpose} | ${receiptToApprove.merchant} | WA:${receiptToApprove.receiptNo}`,
        },
        ...previous,
      ].slice(0, 150);
    });

    setReceiptActionLoadingKey(null);
    api.success("Receipt approved and added to expense ledger.");
  };

  const rejectWhatsAppReceipt = async (receiptKey: string) => {
    if (receiptActionLoadingKey) return;
    setReceiptActionLoadingKey(receiptKey);
    await wait(350 + Math.floor(Math.random() * 250));

    setWhatsAppReceipts((previous) =>
      previous.map((receipt) =>
        receipt.key === receiptKey
          ? {
              ...receipt,
              status: "REJECTED",
              aiNotes: "Rejected by operator. Receipt data did not meet verification rules.",
            }
          : receipt,
      ),
    );

    setReceiptActionLoadingKey(null);
    api.info("Receipt marked as rejected.");
  };

  const openVehicleModalForCreate = () => {
    setSelectedVehicleKey(null);
    vehicleForm.resetFields();
    vehicleForm.setFieldsValue({
      status: "IDLE",
      operationalStatus: "ACTIVE",
    });
    setVehicleModalOpen(true);
  };

  const openVehicleModalForEdit = (vehicle: FleetVehicle) => {
    setSelectedVehicleKey(vehicle.key);
    vehicleForm.setFieldsValue({
      plate: vehicle.plate,
      model: vehicle.model,
      year: String(vehicle.year),
      vin: vehicle.vin,
      trackerName: vehicle.trackerName,
      platformMix: vehicle.platformMix,
      captain: vehicle.captain,
      status: vehicle.status,
      operationalStatus: vehicle.operationalStatus,
    });
    setVehicleModalOpen(true);
  };

  const onSaveVehicle = async () => {
    try {
      const values = await vehicleForm.validateFields();
      const nextPlate = values.plate?.trim() ?? "";
      const nextCaptain = values.captain?.trim() ?? "";
      const nextOperational = values.operationalStatus ?? "ACTIVE";
      const nextStatus =
        nextOperational === "ACTIVE" ? (values.status ?? "IDLE") : "OFFLINE";
      const nextYear = Number(values.year ?? "2024");

      if (!nextPlate || !nextCaptain || !values.model || !values.vin || !values.trackerName || !values.platformMix) {
        api.error("Please fill all required vehicle fields.");
        return;
      }
      if (!Number.isFinite(nextYear) || nextYear < 2000 || nextYear > 2035) {
        api.error("Please enter a valid vehicle year.");
        return;
      }

      const existing = selectedVehicleKey
        ? fleetVehicles.find((vehicle) => vehicle.key === selectedVehicleKey)
        : null;
      const previousCaptain = existing?.captain ?? "";
      const previousPlate = existing?.plate ?? "";
      const onRoadHours = nextOperational === "ACTIVE" ? existing?.onRoadHours ?? 10 : 0;
      const offRoadHours = 24 - onRoadHours;
      const utilizationPct = Math.round((onRoadHours / 24) * 100);

      if (selectedVehicleKey) {
        setFleetVehicles((previous) =>
          previous.map((vehicle) =>
            vehicle.key === selectedVehicleKey
              ? {
                  ...vehicle,
                  plate: nextPlate,
                  model: values.model as string,
                  year: nextYear,
                  vin: values.vin as string,
                  trackerName: values.trackerName as string,
                  platformMix: values.platformMix as string,
                  captain: nextCaptain,
                  status: nextStatus,
                  operationalStatus: nextOperational,
                  onRoadHours,
                  offRoadHours,
                  utilizationPct,
                }
              : vehicle,
          ),
        );
      } else {
        const id = fleetVehicles.length + 1;
        setFleetVehicles((previous) => [
          {
            key: `v-${Date.now()}`,
            plate: nextPlate,
            model: values.model as string,
            year: nextYear,
            vin: values.vin as string,
            captain: nextCaptain,
            platformMix: values.platformMix as string,
            status: nextStatus,
            operationalStatus: nextOperational,
            onRoadHours: nextOperational === "ACTIVE" ? 8 : 0,
            offRoadHours: nextOperational === "ACTIVE" ? 16 : 24,
            completedTrips: nextOperational === "ACTIVE" ? 12 : 0,
            utilizationPct: nextOperational === "ACTIVE" ? 33 : 0,
            lastSeen: formatDateTime(new Date()),
            docsExpiry: "30 Jun 2026",
            trackerName: values.trackerName as string,
            x: 8 + ((id * 7) % 84),
            y: 8 + ((id * 11) % 84),
          },
          ...previous,
        ]);
      }

      setDriverCompliance((previous) =>
        previous.map((driver) => {
          if (driver.name === nextCaptain) {
            return { ...driver, assignedPlate: nextPlate };
          }
          if (selectedVehicleKey && driver.name === previousCaptain && previousCaptain !== nextCaptain) {
            return { ...driver, assignedPlate: "-" };
          }
          if (selectedVehicleKey && driver.assignedPlate === previousPlate && driver.name !== nextCaptain) {
            return { ...driver, assignedPlate: "-" };
          }
          return driver;
        }),
      );

      setVehicleModalOpen(false);
      setSelectedVehicleKey(null);
      vehicleForm.resetFields();
      api.success(selectedVehicleKey ? "Vehicle updated." : "Vehicle added.");
    } catch {
      api.error("Please complete required vehicle fields.");
    }
  };

  const openDriverModalForCreate = () => {
    setSelectedDriverKey(null);
    driverForm.resetFields();
    driverForm.setFieldsValue({
      status: "ACTIVE",
      compliance: "VALID",
    });
    setDriverModalOpen(true);
  };

  const openDriverModalForEdit = (driver: DriverCompliance) => {
    setSelectedDriverKey(driver.key);
    driverForm.setFieldsValue({
      name: driver.name,
      emiratesId: driver.emiratesId,
      licenseNo: driver.licenseNo,
      permitNo: driver.permitNo,
      phone: driver.phone,
      assignedPlate: driver.assignedPlate === "-" ? undefined : driver.assignedPlate,
      status: driver.status,
      compliance: driver.compliance,
    });
    setDriverModalOpen(true);
  };

  const onSaveDriver = async () => {
    try {
      const values = await driverForm.validateFields();
      const name = values.name?.trim() ?? "";
      if (!name || !values.emiratesId || !values.licenseNo || !values.permitNo || !values.phone || !values.status || !values.compliance) {
        api.error("Please complete required driver fields.");
        return;
      }

      const assignedPlate = values.assignedPlate?.trim() || "-";
      const normalizedAssignedPlate = values.status === "LEFT" ? "-" : assignedPlate;
      const existing = selectedDriverKey
        ? driverCompliance.find((driver) => driver.key === selectedDriverKey)
        : null;
      const baseTrips = existing?.completedTrips ?? 0;
      const baseHours = existing?.onlineHours ?? 0;
      const baseAcceptance = existing?.acceptanceRate ?? 92;
      const baseCancellation = existing?.cancellationRate ?? 2.1;

      const nextRow: DriverCompliance = {
        key: selectedDriverKey ?? `dc-${Date.now()}`,
        name,
        emiratesId: values.emiratesId,
        licenseNo: values.licenseNo,
        permitNo: values.permitNo,
        phone: values.phone,
        assignedPlate: normalizedAssignedPlate,
        status: values.status,
        completedTrips: baseTrips,
        onlineHours: baseHours,
        acceptanceRate: baseAcceptance,
        cancellationRate: baseCancellation,
        compliance: values.compliance,
      };

      if (selectedDriverKey) {
        setDriverCompliance((previous) =>
          previous.map((driver) => (driver.key === selectedDriverKey ? nextRow : driver)),
        );
      } else {
        setDriverCompliance((previous) => [nextRow, ...previous]);
      }

      setFleetVehicles((previous) =>
        previous.map((vehicle) => {
          if (selectedDriverKey && existing && existing.assignedPlate !== "-" && existing.assignedPlate === vehicle.plate && normalizedAssignedPlate !== vehicle.plate) {
            return {
              ...vehicle,
              captain: "Unassigned",
              status: vehicle.operationalStatus === "ACTIVE" ? "IDLE" : "OFFLINE",
            };
          }
          if (normalizedAssignedPlate !== "-" && vehicle.plate === normalizedAssignedPlate) {
            return {
              ...vehicle,
              captain: name,
              status: values.status === "ACTIVE" && vehicle.operationalStatus === "ACTIVE" ? "IDLE" : vehicle.status,
            };
          }
          if (selectedDriverKey && existing && vehicle.captain === existing.name && existing.name !== name && normalizedAssignedPlate === vehicle.plate) {
            return {
              ...vehicle,
              captain: name,
            };
          }
          return vehicle;
        }),
      );

      setDriverModalOpen(false);
      setSelectedDriverKey(null);
      driverForm.resetFields();
      api.success(selectedDriverKey ? "Driver updated." : "Driver added.");
    } catch {
      api.error("Please complete required driver fields.");
    }
  };

  const onLogin = async () => {
    try {
      const values = await loginForm.validateFields();
      if (
        values.username !== APP_LOGIN_CREDENTIALS.username ||
        values.password !== APP_LOGIN_CREDENTIALS.password
      ) {
        loginForm.setFieldValue("password", "");
        api.error("Invalid username or password.");
        return;
      }

      setIsAuthenticated(true);
      api.success("Logged in.");
    } catch {
      api.error("Please enter username and password.");
    }
  };

  const onProfileAction: MenuProps["onClick"] = ({ key }) => {
    if (key === "account") {
      setActiveMenu("settings");
      api.info("Open settings to update account details.");
      return;
    }

    if (key === "company") {
      setActiveMenu("settings");
      api.info("Open settings to update company details.");
      return;
    }

    if (key === "logout") {
      resetAppToDefaults();
      setIsAuthenticated(false);
      api.success("Logged out. App has been reset to default.");
    }
  };

  const saveCompanySettings = async () => {
    try {
      await companyForm.validateFields();
      api.success("Company settings saved.");
    } catch {
      api.error("Please fill required company fields.");
    }
  };

  const renderApiConnectorForm = (platform: Platform) => {
    const authMethod = authMethods[platform];
    const platformName = platformNameMap[platform];
    const form = getFormForPlatform(platform);

    return (
      <Form form={form} layout="vertical" requiredMark initialValues={{ authMethod }}>
        <Form.Item
          label="Account / Organization ID"
          name="accountId"
          rules={[{ required: true, message: "Account / Organization ID is required." }]}
          extra="Use the enterprise account ID provided by the platform."
        >
          <Input placeholder={`Your ${platformName} enterprise account ID`} />
        </Form.Item>

        <Form.Item
          label="Authentication Method"
          name="authMethod"
          rules={[{ required: true, message: "Authentication method is required." }]}
          extra="Choose the method enabled on your platform account."
        >
          <Select
            value={authMethod}
            onChange={(value: AuthMethod) => {
              setAuthMethodForPlatform(platform, value);
              form.setFieldValue("authMethod", value);
            }}
            options={[
              { value: "OAUTH_CLIENT_CREDENTIALS", label: authMethodLabelMap.OAUTH_CLIENT_CREDENTIALS },
              { value: "API_KEY", label: authMethodLabelMap.API_KEY },
              { value: "BEARER_TOKEN", label: authMethodLabelMap.BEARER_TOKEN },
            ]}
          />
        </Form.Item>

        {authMethod === "OAUTH_CLIENT_CREDENTIALS" && (
          <>
            <Form.Item
              label="Client ID"
              name="clientId"
              preserve={false}
              rules={[{ required: true, message: "Client ID is required." }]}
              extra="This is issued by the platform’s enterprise API team."
            >
              <Input placeholder={`Paste ${platformName} client ID`} />
            </Form.Item>
            <Form.Item
              label="Client Secret"
              name="clientSecret"
              preserve={false}
              rules={[{ required: true, message: "Client Secret is required." }]}
            >
              <Input.Password placeholder={`Paste ${platformName} client secret`} />
            </Form.Item>
          </>
        )}

        {authMethod === "API_KEY" && (
          <>
            <Form.Item
              label="API Key"
              name="apiKey"
              preserve={false}
              rules={[{ required: true, message: "API Key is required." }]}
            >
              <Input.Password placeholder={`Paste ${platformName} API key`} />
            </Form.Item>
            <Form.Item
              label="API Secret (if required)"
              name="apiSecret"
              preserve={false}
              extra="Leave blank only if this platform does not issue API secrets."
            >
              <Input.Password placeholder={`Paste ${platformName} API secret (optional if not required)`} />
            </Form.Item>
          </>
        )}

        {authMethod === "BEARER_TOKEN" && (
          <Form.Item
            label="Access Token"
            name="accessToken"
            preserve={false}
            rules={[{ required: true, message: "Access Token is required." }]}
            extra="Paste full token exactly as received from the platform."
          >
            <Input.Password placeholder={`Paste ${platformName} access token`} />
          </Form.Item>
        )}

        <Space wrap>
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => void onSaveConnector(platform)}>
            Save {platformName} Connector
          </Button>
          <Button
            icon={<SyncOutlined />}
            loading={testingConnections[platform]}
            disabled={testingConnections[platform]}
            onClick={() => void onTestConnection(platform)}
          >
            Test Connection
          </Button>
          <Typography.Text type="secondary">Status:</Typography.Text>
          {connectionStatusTag(platformConnectionHealth[platform])}
        </Space>
      </Form>
    );
  };

  const platformColumns: TableProps<PlatformRow>["columns"] = [
    {
      title: "Platform",
      dataIndex: "platform",
      key: "platform",
      render: (platform: Platform) => <PlatformBrand platform={platform} />,
    },
    {
      title: "Data Mode",
      dataIndex: "mode",
      key: "mode",
      render: (mode: string) => <Tag color={mode === "API Connector" ? "blue" : "default"}>{mode}</Tag>,
    },
    {
      title: "Connector",
      key: "connectorHealth",
      render: (_value, row) =>
        selectedModes[row.platform] === "API" ? connectionStatusTag(platformConnectionHealth[row.platform]) : <Tag>Upload Mode</Tag>,
    },
    {
      title: "Imported Today",
      dataIndex: "todayImported",
      key: "todayImported",
    },
    {
      title: "Ready for LES",
      dataIndex: "readyForLes",
      key: "readyForLes",
    },
    {
      title: "Failed",
      dataIndex: "failed",
      key: "failed",
      render: (failed: number) => <Tag color={failed > 0 ? "warning" : "success"}>{failed}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_value, row) =>
        row.failed > 0 ? (
          <Button
            size="small"
            icon={<SyncOutlined />}
            disabled={lesSubmitting}
            loading={lesSubmitting}
            onClick={() => void runLesSubmissionSimulation({ type: "failed-platform", platform: row.platform })}
          >
            Resubmit Failed
          </Button>
        ) : (
          <Typography.Text type="secondary">No failed trips</Typography.Text>
        ),
    },
  ];

  const ingestColumns: TableProps<IngestRun>["columns"] = [
    {
      title: "Time",
      dataIndex: "runAt",
      key: "runAt",
    },
    {
      title: "Platform",
      dataIndex: "platform",
      key: "platform",
      render: (platform: Platform) => <PlatformBrand platform={platform} />,
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (source: IngestSource) => <Tag color={source === "API" ? "geekblue" : "gold"}>{source === "API" ? "API Pull" : "Export Upload"}</Tag>,
    },
    {
      title: "Fetched",
      dataIndex: "fetched",
      key: "fetched",
    },
    {
      title: "Mapped",
      dataIndex: "mapped",
      key: "mapped",
    },
    {
      title: "Failed",
      dataIndex: "failed",
      key: "failed",
      render: (failed: number) => <Tag color={failed > 0 ? "warning" : "success"}>{failed}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: IngestStatus) => {
        if (status === "SUCCESS") return <Tag color="success">Completed</Tag>;
        if (status === "PARTIAL") return <Tag color="warning">Completed with issues</Tag>;
        return <Tag>Awaiting upload</Tag>;
      },
    },
  ];

  const failedTripsColumns: TableProps<FailedTrip>["columns"] = [
    {
      title: "Trip Ref",
      dataIndex: "tripRef",
      key: "tripRef",
    },
    {
      title: "Platform",
      dataIndex: "platform",
      key: "platform",
      render: (platform: Platform) => <PlatformBrand platform={platform} />,
    },
    {
      title: "Captain",
      dataIndex: "driverName",
      key: "driverName",
    },
    {
      title: "Vehicle",
      dataIndex: "vehicleCode",
      key: "vehicleCode",
    },
    {
      title: "Missing / Invalid Field",
      dataIndex: "field",
      key: "field",
    },
    {
      title: "Reason",
      dataIndex: "issue",
      key: "issue",
    },
    {
      title: "Last Attempt",
      dataIndex: "lastAttempt",
      key: "lastAttempt",
    },
    {
      title: "Action",
      key: "action",
      render: (_value, row) => (
        <Button
          size="small"
          icon={<SyncOutlined />}
          loading={retryingTripKey === row.key}
          onClick={() => void retrySingleFailedTrip(row)}
        >
          Retry this trip
        </Button>
      ),
    },
  ];

  const submissionHistoryColumns: TableProps<SubmissionHistoryRow>["columns"] = [
    {
      title: "Started",
      dataIndex: "startedAt",
      key: "startedAt",
    },
    {
      title: "Scope",
      dataIndex: "scope",
      key: "scope",
    },
    {
      title: "Trips",
      dataIndex: "ready",
      key: "ready",
    },
    {
      title: "Submitted",
      dataIndex: "submitted",
      key: "submitted",
    },
    {
      title: "Failed",
      dataIndex: "failed",
      key: "failed",
      render: (failed: number) => <Tag color={failed > 0 ? "warning" : "success"}>{failed}</Tag>,
    },
    {
      title: "Duration",
      dataIndex: "durationSec",
      key: "durationSec",
      render: (durationSec: number) => `${durationSec}s`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: SubmissionHistoryRow["status"]) => {
        if (status === "SUCCESS") return <Tag color="success">Success</Tag>;
        if (status === "PARTIAL") return <Tag color="warning">Partial</Tag>;
        return <Tag color="error">Failed</Tag>;
      },
    },
  ];

  const fleetColumns: TableProps<FleetVehicle>["columns"] = [
    {
      title: "Plate",
      dataIndex: "plate",
      key: "plate",
    },
    {
      title: "Vehicle",
      dataIndex: "model",
      key: "model",
      render: (model: string, row) => `${row.year} ${model}`,
    },
    {
      title: "Captain",
      dataIndex: "captain",
      key: "captain",
    },
    {
      title: "Platform Mix",
      dataIndex: "platformMix",
      key: "platformMix",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: FleetVehicle["status"]) => {
        if (status === "ON_TRIP") return <Tag color="processing">On Trip</Tag>;
        if (status === "IDLE") return <Tag color="success">Idle</Tag>;
        return <Tag color="default">Offline</Tag>;
      },
    },
    {
      title: "Operational",
      dataIndex: "operationalStatus",
      key: "operationalStatus",
      render: (operationalStatus: FleetVehicle["operationalStatus"]) =>
        operationalStatus === "ACTIVE" ? <Tag color="success">Active</Tag> : <Tag color="warning">Off Service</Tag>,
    },
    {
      title: "Last Seen",
      dataIndex: "lastSeen",
      key: "lastSeen",
    },
    {
      title: "Permit/Docs Expiry",
      dataIndex: "docsExpiry",
      key: "docsExpiry",
    },
    {
      title: "Tracker",
      dataIndex: "trackerName",
      key: "trackerName",
    },
    {
      title: "On Road (h)",
      dataIndex: "onRoadHours",
      key: "onRoadHours",
    },
    {
      title: "Off Road (h)",
      dataIndex: "offRoadHours",
      key: "offRoadHours",
    },
    {
      title: "Trips",
      dataIndex: "completedTrips",
      key: "completedTrips",
    },
    {
      title: "Utilization",
      dataIndex: "utilizationPct",
      key: "utilizationPct",
      render: (utilizationPct: number) => `${utilizationPct}%`,
    },
    {
      title: "VIN",
      dataIndex: "vin",
      key: "vin",
    },
    {
      title: "Action",
      key: "action",
      render: (_value, row) => (
        <Button size="small" onClick={() => openVehicleModalForEdit(row)}>
          Edit Vehicle
        </Button>
      ),
    },
  ];

  const driverComplianceColumns: TableProps<DriverCompliance>["columns"] = [
    {
      title: "Driver",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Emirates ID",
      dataIndex: "emiratesId",
      key: "emiratesId",
    },
    {
      title: "Driving License",
      dataIndex: "licenseNo",
      key: "licenseNo",
    },
    {
      title: "Limousine Permit",
      dataIndex: "permitNo",
      key: "permitNo",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Assigned Vehicle",
      dataIndex: "assignedPlate",
      key: "assignedPlate",
    },
    {
      title: "Driver Status",
      dataIndex: "status",
      key: "status",
      render: (status: DriverCompliance["status"]) => {
        if (status === "ACTIVE") return <Tag color="success">Active</Tag>;
        if (status === "SICK") return <Tag color="warning">Sick</Tag>;
        if (status === "ON_LEAVE") return <Tag>On Leave</Tag>;
        return <Tag color="default">Left</Tag>;
      },
    },
    {
      title: "Trips",
      dataIndex: "completedTrips",
      key: "completedTrips",
    },
    {
      title: "Accept %",
      dataIndex: "acceptanceRate",
      key: "acceptanceRate",
      render: (acceptanceRate: number) => `${acceptanceRate.toFixed(1)}%`,
    },
    {
      title: "Online Hours",
      dataIndex: "onlineHours",
      key: "onlineHours",
      render: (onlineHours: number) => onlineHours.toFixed(1),
    },
    {
      title: "Cancel %",
      dataIndex: "cancellationRate",
      key: "cancellationRate",
      render: (cancellationRate: number) => `${cancellationRate.toFixed(1)}%`,
    },
    {
      title: "Compliance Status",
      dataIndex: "compliance",
      key: "compliance",
      render: (compliance: DriverCompliance["compliance"]) => {
        if (compliance === "VALID") return <Tag color="success">Valid</Tag>;
        if (compliance === "EXPIRING_SOON") return <Tag color="warning">Expiring Soon</Tag>;
        return <Tag color="error">Missing Document</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_value, row) => (
        <Button size="small" onClick={() => openDriverModalForEdit(row)}>
          Edit Driver
        </Button>
      ),
    },
  ];

  const captainEarningsColumns: TableProps<CaptainEarningsRow>["columns"] = [
    {
      title: "Driver",
      dataIndex: "driver",
      key: "driver",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: DriverCompliance["status"]) =>
        status === "ACTIVE" ? <Tag color="success">Active</Tag> : <Tag color="warning">{status.replace("_", " ")}</Tag>,
    },
    {
      title: "Assigned Vehicle",
      dataIndex: "assignedPlate",
      key: "assignedPlate",
    },
    {
      title: "Total Earnings (AED)",
      dataIndex: "totalEarnings",
      key: "totalEarnings",
      render: (value: number) => value.toFixed(2),
    },
    {
      title: "Refunds/Expenses (AED)",
      dataIndex: "refundsExpenses",
      key: "refundsExpenses",
      render: (value: number) => value.toFixed(2),
    },
    {
      title: "Payouts (AED)",
      dataIndex: "payouts",
      key: "payouts",
      render: (value: number) => value.toFixed(2),
    },
    {
      title: "Net Earnings (AED)",
      dataIndex: "netEarnings",
      key: "netEarnings",
      render: (value: number) => value.toFixed(2),
    },
  ];

  const expenseColumns: TableProps<ExpenseEntry>["columns"] = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: ExpenseCategory) => <Tag color={category === "FUEL" ? "blue" : category === "FINE" ? "volcano" : "default"}>{category}</Tag>,
    },
    {
      title: "Vehicle",
      dataIndex: "vehiclePlate",
      key: "vehiclePlate",
    },
    {
      title: "Driver",
      dataIndex: "driverName",
      key: "driverName",
      render: (driverName?: string) => driverName ?? "-",
    },
    {
      title: "Amount (AED)",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => amount.toFixed(2),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => notes || "-",
    },
    {
      title: "Action",
      key: "action",
      render: (_value, row) => (
        <Button size="small" onClick={() => openExpenseModalForEdit(row)}>
          Edit
        </Button>
      ),
    },
  ];

  const whatsAppReceiptColumns: TableProps<WhatsAppReceipt>["columns"] = [
    {
      title: "Received",
      dataIndex: "receivedAt",
      key: "receivedAt",
    },
    {
      title: "Driver",
      dataIndex: "driverName",
      key: "driverName",
    },
    {
      title: "Phone",
      dataIndex: "driverPhone",
      key: "driverPhone",
    },
    {
      title: "Vehicle",
      dataIndex: "vehiclePlate",
      key: "vehiclePlate",
    },
    {
      title: "Type",
      dataIndex: "category",
      key: "category",
      render: (category: ExpenseCategory) => <Tag color={category === "FUEL" ? "blue" : "default"}>{category}</Tag>,
    },
    {
      title: "Amount (AED)",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => amount.toFixed(2),
    },
    {
      title: "Receipt",
      key: "receipt",
      render: (_value, row) =>
        row.attachmentUrl ? (
          <Button size="small" icon={<EyeOutlined />} onClick={() => openWhatsAppReceipt(row)}>
            View image
          </Button>
        ) : (
          <Upload {...whatsAppAttachmentUploadProps(row.key)}>
            <Button size="small" icon={<UploadOutlined />}>
              Attach
            </Button>
          </Upload>
        ),
    },
    {
      title: "AI Confidence",
      dataIndex: "confidence",
      key: "confidence",
      render: (confidence: number) => (
        <span>{confidence}%</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: WhatsAppReceiptStatus) => {
        if (status === "NEW") return <Tag>New</Tag>;
        if (status === "AI_REVIEWED") return <Tag color="processing">AI Reviewed</Tag>;
        if (status === "APPROVED") return <Tag color="success">Approved</Tag>;
        return <Tag color="error">Rejected</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_value, row) => (
        <Space wrap size={6}>
          <Button size="small" onClick={() => openWhatsAppReceipt(row)}>
            Open
          </Button>
          <Button
            size="small"
            loading={aiReviewingReceiptKey === row.key}
            disabled={row.status === "APPROVED" || aiReviewingReceiptKey === row.key}
            onClick={() => void runAiReviewOnReceipt(row.key)}
          >
            AI Review
          </Button>
          <Button
            size="small"
            type="primary"
            disabled={row.status === "APPROVED" || row.status === "REJECTED"}
            loading={receiptActionLoadingKey === row.key}
            onClick={() => void approveWhatsAppReceipt(row.key)}
          >
            Approve
          </Button>
          <Button
            size="small"
            danger
            disabled={row.status === "APPROVED" || row.status === "REJECTED"}
            loading={receiptActionLoadingKey === row.key}
            onClick={() => void rejectWhatsAppReceipt(row.key)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  const reportColumns: TableProps<ReportJob>["columns"] = [
    {
      title: "Report",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Period",
      dataIndex: "period",
      key: "period",
    },
    {
      title: "Generated",
      dataIndex: "generatedAt",
      key: "generatedAt",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: ReportJob["status"]) =>
        status === "READY" ? <Tag color="success">Ready</Tag> : <Tag color="processing">Generating</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_value, row) =>
        row.status === "READY" ? <Button size="small">Download</Button> : <Typography.Text type="secondary">Please wait</Typography.Text>,
    },
  ];

  const driverPerformanceColumns: TableProps<(typeof driverPerformanceRows)[number]>["columns"] = [
    { title: "Driver", dataIndex: "driver", key: "driver" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: DriverCompliance["status"]) =>
        status === "ACTIVE" ? <Tag color="success">Active</Tag> : <Tag color="warning">{status}</Tag>,
    },
    { title: "Vehicle", dataIndex: "assignedPlate", key: "assignedPlate" },
    { title: "Trips", dataIndex: "trips", key: "trips" },
    { title: "Acceptance", dataIndex: "acceptanceRate", key: "acceptanceRate", render: (value: number) => `${value.toFixed(1)}%` },
    { title: "Online Hours", dataIndex: "onlineHours", key: "onlineHours", render: (value: number) => value.toFixed(1) },
    { title: "Cancellation", dataIndex: "cancellationRate", key: "cancellationRate", render: (value: number) => `${value.toFixed(1)}%` },
    { title: "Net (AED)", dataIndex: "netEarnings", key: "netEarnings", render: (value: number) => value.toFixed(2) },
  ];

  const vehiclePerformanceColumns: TableProps<(typeof vehiclePerformanceRows)[number]>["columns"] = [
    { title: "Plate", dataIndex: "plate", key: "plate" },
    { title: "Vehicle", dataIndex: "model", key: "model" },
    { title: "Driver", dataIndex: "captain", key: "captain" },
    {
      title: "Operational",
      dataIndex: "operationalStatus",
      key: "operationalStatus",
      render: (status: FleetVehicle["operationalStatus"]) => <Tag>{status.replace("_", " ")}</Tag>,
    },
    { title: "On Road (h)", dataIndex: "onRoadHours", key: "onRoadHours" },
    { title: "Off Road (h)", dataIndex: "offRoadHours", key: "offRoadHours" },
    { title: "Trips", dataIndex: "completedTrips", key: "completedTrips" },
    { title: "Utilization", dataIndex: "utilizationPct", key: "utilizationPct", render: (value: number) => `${value}%` },
  ];

  const renderDashboard = () => {
    const activeDriversCount = driverCompliance.filter((item) => item.status === "ACTIVE").length;
    const unavailableDriversCount = driverCompliance.filter((item) => item.status !== "ACTIVE").length;
    const pendingWhatsAppCount = whatsAppReceipts.filter((item) => item.status !== "APPROVED" && item.status !== "REJECTED").length;
    const vehicleAttentionRows = fleetVehicles
      .filter((item) => item.operationalStatus === "OFF_SERVICE" || item.status === "OFFLINE")
      .slice(0, 6);
    const driverAttentionRows = driverCompliance
      .filter((item) => item.compliance !== "VALID" || item.status !== "ACTIVE")
      .slice(0, 6);
    const recentExpenseRows = expenses.slice(0, 6);

    return (
      <Space direction="vertical" size={16} className="w-full">
        <Alert
          type="info"
          showIcon
          message="Operations dashboard"
          description="Use this page as your control center for fleet, drivers, money, and LES operations."
        />

        <Card className="hero-card">
          <Row gutter={[20, 20]} align="middle">
            <Col xs={24} lg={15}>
              <Tag color="gold" className="hero-chip">Control Center</Tag>
              <Typography.Title level={2} className="hero-title">
                One place to run your limousine business
              </Typography.Title>
              <Typography.Paragraph className="hero-subtitle">
                Add drivers and vehicles, review financials, and open LES workflows only when needed.
              </Typography.Paragraph>
              <Space wrap>
                <Button type="primary" size="large" icon={<UserOutlined />} className="hero-primary-btn" onClick={openDriverModalForCreate}>
                  Add Driver
                </Button>
                <Button size="large" icon={<CarOutlined />} onClick={openVehicleModalForCreate}>
                  Add Vehicle
                </Button>
                <Button size="large" icon={<DollarOutlined />} onClick={openExpenseModalForCreate}>
                  Add Expense
                </Button>
                <Button size="large" icon={<SafetyOutlined />} onClick={() => openLesSection("overview")}>
                  Open LES Center
                </Button>
              </Space>
            </Col>
            <Col xs={24} lg={9}>
              <div className="hero-metric-grid">
                <div className="hero-metric">
                  <div className="hero-metric-label">Fleet Active</div>
                  <div className="hero-metric-value">{fleetStats.total - fleetStats.offService}</div>
                </div>
                <div className="hero-metric">
                  <div className="hero-metric-label">Drivers Active</div>
                  <div className="hero-metric-value">{activeDriversCount}</div>
                </div>
                <div className="hero-metric">
                  <div className="hero-metric-label">Net After Ops</div>
                  <div className="hero-metric-value">AED {financeTotals.netAfterOps.toFixed(0)}</div>
                </div>
                <div className="hero-metric">
                  <div className="hero-metric-label">LES Issues</div>
                  <div className="hero-metric-value">{dashboardTotals.failed}</div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        <Row gutter={16}>
          <Col xs={24} md={12} xl={6}>
            <Card className="glass-card kpi-card kpi-card--one">
              <Statistic title="Vehicles On Trip" value={fleetStats.onTrip} />
            </Card>
          </Col>
          <Col xs={24} md={12} xl={6}>
            <Card className="glass-card kpi-card kpi-card--two">
              <Statistic title="Vehicles Off Service" value={fleetStats.offService} valueStyle={{ color: "#b45309" }} />
            </Card>
          </Col>
          <Col xs={24} md={12} xl={6}>
            <Card className="glass-card kpi-card kpi-card--three">
              <Statistic title="Driver Compliance Issues" value={complianceStats.expiring + complianceStats.missing} valueStyle={{ color: "#dc2626" }} />
            </Card>
          </Col>
          <Col xs={24} md={12} xl={6}>
            <Card className="glass-card kpi-card kpi-card--four">
              <Statistic title="WhatsApp Pending Review" value={pendingWhatsAppCount} />
            </Card>
          </Col>
        </Row>

        <Card className="glass-card" title="Task Center">
          <Space wrap>
            <Button icon={<CarOutlined />} onClick={() => setActiveMenu("vehicles")}>
              Open Vehicles
            </Button>
            <Button icon={<UserOutlined />} onClick={() => setActiveMenu("drivers")}>
              Open Drivers
            </Button>
            <Button icon={<DollarOutlined />} onClick={() => setActiveMenu("finance")}>
              Open Money
            </Button>
            <Button icon={<FileDoneOutlined />} onClick={() => setActiveMenu("reports")}>
              Open Reports
            </Button>
            <Button icon={<SyncOutlined />} loading={syncRunning} onClick={() => void runIngestionNow()}>
              Pull Trip Data
            </Button>
            <Button icon={<FileSearchOutlined />} loading={validatingTrips} onClick={() => void validateImportedTrips()}>
              Validate Trip Data
            </Button>
            <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => openLesSection("submission")}>
              Submit/Resubmit Trips
            </Button>
          </Space>
        </Card>

        <Row gutter={16}>
          <Col xs={24} xl={8}>
            <Card className="glass-card" title={`Vehicles Needing Attention (${vehicleAttentionRows.length})`}>
              <Space direction="vertical" size={8} className="w-full">
                {vehicleAttentionRows.length === 0 ? (
                  <Typography.Text type="secondary">No vehicles currently flagged.</Typography.Text>
                ) : (
                  vehicleAttentionRows.map((vehicle) => (
                    <div key={vehicle.key} className="dashboard-list-row">
                      <Typography.Text strong>{vehicle.plate}</Typography.Text>
                      <Typography.Text type="secondary">{vehicle.captain}</Typography.Text>
                      <Tag color={vehicle.operationalStatus === "OFF_SERVICE" ? "warning" : "default"}>
                        {vehicle.operationalStatus === "OFF_SERVICE" ? "Off Service" : "Offline"}
                      </Tag>
                    </div>
                  ))
                )}
              </Space>
            </Card>
          </Col>
          <Col xs={24} xl={8}>
            <Card className="glass-card" title={`Driver Watchlist (${driverAttentionRows.length})`}>
              <Space direction="vertical" size={8} className="w-full">
                {driverAttentionRows.length === 0 ? (
                  <Typography.Text type="secondary">No driver alerts right now.</Typography.Text>
                ) : (
                  driverAttentionRows.map((driver) => (
                    <div key={driver.key} className="dashboard-list-row">
                      <Typography.Text strong>{driver.name}</Typography.Text>
                      <Typography.Text type="secondary">{driver.assignedPlate}</Typography.Text>
                      <Tag color={driver.compliance === "MISSING" ? "error" : driver.compliance === "EXPIRING_SOON" ? "warning" : "default"}>
                        {driver.compliance === "VALID" ? driver.status.replace("_", " ") : driver.compliance.replace("_", " ")}
                      </Tag>
                    </div>
                  ))
                )}
              </Space>
            </Card>
          </Col>
          <Col xs={24} xl={8}>
            <Card className="glass-card" title="Money Snapshot">
              <Space direction="vertical" size={10} className="w-full">
                <div className="dashboard-list-row">
                  <Typography.Text>Total Earnings</Typography.Text>
                  <Typography.Text strong>AED {financeTotals.totalEarnings.toFixed(2)}</Typography.Text>
                </div>
                <div className="dashboard-list-row">
                  <Typography.Text>Operating Expenses</Typography.Text>
                  <Typography.Text strong>AED {financeTotals.operatingExpenses.toFixed(2)}</Typography.Text>
                </div>
                <div className="dashboard-list-row">
                  <Typography.Text>Drivers Unavailable</Typography.Text>
                  <Typography.Text strong>{unavailableDriversCount}</Typography.Text>
                </div>
                <Divider className="card-divider" />
                <Typography.Text strong>Latest Expenses</Typography.Text>
                {recentExpenseRows.map((item) => (
                  <div key={item.key} className="dashboard-list-row">
                    <Typography.Text type="secondary">{item.vehiclePlate} · {item.category}</Typography.Text>
                    <Typography.Text strong>AED {item.amount.toFixed(2)}</Typography.Text>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    );
  };

  const renderConnectors = () => (
    <Space direction="vertical" size={16} className="w-full">
      <Alert
        type="info"
        showIcon
        message="Connections setup"
        description="For Uber, Careem, and inDrive you can use either API Connector or Export Upload mode. Save and test each connection before automation."
      />

      <Card className="glass-card" title="LES API Connection (Required)">
        <Form form={lesConnectorForm} layout="vertical" requiredMark>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="LES Base URL"
                name="baseUrl"
                rules={[{ required: true, message: "LES Base URL is required." }]}
                extra="Use the official LES base URL shared with your company."
              >
                <Input placeholder="https://les-api.example.gov.ae" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Company ID"
                name="companyId"
                rules={[{ required: true, message: "Company ID is required." }]}
              >
                <Input placeholder="Your LES company identifier" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Client ID"
                name="clientId"
                rules={[{ required: true, message: "Client ID is required." }]}
              >
                <Input placeholder="LES client ID" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Client Secret"
                name="clientSecret"
                rules={[{ required: true, message: "Client Secret is required." }]}
              >
                <Input.Password placeholder="LES client secret" />
              </Form.Item>
            </Col>
          </Row>
          <Space wrap>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => void onSaveLesConnector()}>
              Save LES Connector
            </Button>
            <Button
              icon={<SyncOutlined />}
              loading={testingLesConnection}
              disabled={testingLesConnection}
              onClick={() => void onTestLesConnection()}
            >
              Test LES Connection
            </Button>
            <Typography.Text type="secondary">Status:</Typography.Text>
            {connectionStatusTag(lesConnectionHealth)}
          </Space>
        </Form>
      </Card>

      {(Object.keys(platformNameMap) as Platform[]).map((platform) => {
        const mode = selectedModes[platform];
        return (
          <Card
            key={platform}
            className="glass-card"
            title={
              <Space size={10}>
                <img src={platformLogoMap[platform]} alt={`${platformNameMap[platform]} logo`} className="platform-logo-large" />
                <span>{platformNameMap[platform]}</span>
              </Space>
            }
          >
            <Space direction="vertical" size={12} className="w-full">
              <div>
                <Typography.Text strong>Choose data mode</Typography.Text>
                <Select
                  value={mode}
                  onChange={(value: Mode) => setModeForPlatform(platform, value)}
                  options={[
                    { value: "API", label: "API Connector" },
                    { value: "UPLOAD", label: "Export Upload" },
                  ]}
                  className="field-full top-gap"
                />
                <Typography.Text type="secondary">Required: choose one mode before continuing.</Typography.Text>
              </div>

              <Divider className="card-divider" />

              {mode === "API" ? (
                renderApiConnectorForm(platform)
              ) : (
                <Space direction="vertical">
                  <Typography.Text>1) Export trip file from {platformNameMap[platform]} supplier/enterprise portal.</Typography.Text>
                  <Typography.Text>2) Upload the file in LES Center / Submission.</Typography.Text>
                  <Typography.Text>3) Validate and submit trips in LES Center / Submission.</Typography.Text>
                </Space>
              )}
            </Space>
          </Card>
        );
      })}
    </Space>
  );

  const renderLesControl = () => (
    <Space direction="vertical" size={16} className="w-full">
      <Alert
        type="success"
        showIcon
        message="LES submission control"
        description="Use this screen for monitored submission runs and targeted resubmission when failures remain in queue."
      />

      <Card className="glass-card" title="Run LES Submission">
        <Space wrap>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled={lesSubmitting}
            onClick={() => void runLesSubmissionSimulation({ type: "ready-all" })}
          >
            Submit All Ready Trips
          </Button>
          <Button
            icon={<SyncOutlined />}
            disabled={lesSubmitting || dashboardTotals.failed === 0}
            onClick={() => void runLesSubmissionSimulation({ type: "failed-all" })}
          >
            Resubmit All Failed Trips
          </Button>
          <Tag color={lesConnectionHealth === "CONNECTED" ? "success" : "warning"}>
            LES Connector: {lesConnectionHealth === "CONNECTED" ? "Connected" : "Not ready"}
          </Tag>
        </Space>
      </Card>

      <Card className="glass-card" title="Today by Platform">
        <Table columns={platformColumns} dataSource={platformRowsWithSelectedMode} pagination={false} />
      </Card>

      <Card className="glass-card" title="Upload Center (If platform API is not available)">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Card className="glass-card" title="Uber Upload">
              <Upload.Dragger {...uploadProps("UBER")}>
                <p className="ant-upload-text">Drop Uber CSV/XLSX here</p>
                <p className="ant-upload-hint">Export from Uber supplier portal, then upload here.</p>
              </Upload.Dragger>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="glass-card" title="Careem Upload">
              <Upload.Dragger {...uploadProps("CAREEM")}>
                <p className="ant-upload-text">Drop Careem CSV/XLSX here</p>
                <p className="ant-upload-hint">Export from Careem supplier dashboard, then upload here.</p>
              </Upload.Dragger>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="glass-card" title="inDrive Upload">
              <Upload.Dragger {...uploadProps("INDRIVE")}>
                <p className="ant-upload-text">Drop inDrive CSV/XLSX here</p>
                <p className="ant-upload-hint">Export from inDrive enterprise view, then upload here.</p>
              </Upload.Dragger>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card className="glass-card" title="Latest Ingestion Runs">
        <Table columns={ingestColumns} dataSource={ingestRuns} pagination={{ pageSize: 6 }} />
      </Card>

      <Card className="glass-card" title={`Failed Trips Queue (${failedTrips.length})`}>
        <Table columns={failedTripsColumns} dataSource={failedTrips} pagination={{ pageSize: 6 }} />
      </Card>
    </Space>
  );

  const renderAutomation = () => (
    <Space direction="vertical" size={16} className="w-full">
      <Alert
        type="info"
        showIcon
        message="Autopilot mode"
        description="After setup is healthy, the system can continuously pull trips and submit to LES without daily login."
      />

      <Card className="glass-card" title="Readiness Status">
        <Space direction="vertical" size={10} className="w-full">
          <div>
            <Typography.Text strong>LES Connection: </Typography.Text>
            {connectionStatusTag(lesConnectionHealth)}
          </div>
          <div>
            <Typography.Text strong>Uber: </Typography.Text>
            {selectedModes.UBER === "API" ? connectionStatusTag(platformConnectionHealth.UBER) : <Tag>Upload Mode</Tag>}
          </div>
          <div>
            <Typography.Text strong>Careem: </Typography.Text>
            {selectedModes.CAREEM === "API" ? connectionStatusTag(platformConnectionHealth.CAREEM) : <Tag>Upload Mode</Tag>}
          </div>
          <div>
            <Typography.Text strong>inDrive: </Typography.Text>
            {selectedModes.INDRIVE === "API" ? connectionStatusTag(platformConnectionHealth.INDRIVE) : <Tag>Upload Mode</Tag>}
          </div>
          {!automationReady && (
            <Typography.Text type="secondary">
              To enable automation, LES and all platforms in API mode must pass connection tests.
            </Typography.Text>
          )}
        </Space>
      </Card>

      <Card className="glass-card" title="Scheduler">
        <Space direction="vertical" size={12} className="w-full">
          <Space wrap>
            <Typography.Text strong>Auto Submission</Typography.Text>
            <Switch checked={autoSubmitEnabled} onChange={onToggleAutoSubmit} />
            {autoSubmitEnabled ? <Tag color="success">Enabled</Tag> : <Tag>Paused</Tag>}
          </Space>

          <Space wrap>
            <Typography.Text strong>Run Frequency</Typography.Text>
            <Select
              value={autoSchedule}
              onChange={(value: AutomationSchedule) => onAutomationScheduleChange(value)}
              options={[
                { value: "15_MIN", label: scheduleLabelMap["15_MIN"] },
                { value: "30_MIN", label: scheduleLabelMap["30_MIN"] },
                { value: "60_MIN", label: scheduleLabelMap["60_MIN"] },
              ]}
              style={{ minWidth: 220 }}
            />
          </Space>

          <Space wrap>
            <Typography.Text strong>Notify only on failures</Typography.Text>
            <Switch checked={autoFailureOnlyAlerts} onChange={setAutoFailureOnlyAlerts} />
          </Space>

          <Space wrap>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              loading={autoSubmitRunning}
              disabled={autoSubmitRunning}
              onClick={() => void runAutomationNow()}
            >
              Run Automation Now
            </Button>
            <Typography.Text type="secondary">Last run: {autoLastRunText}</Typography.Text>
            <Typography.Text type="secondary">Next run: {autoNextRunText}</Typography.Text>
          </Space>
        </Space>
      </Card>
    </Space>
  );

  const renderLesOverview = () => (
    <Space direction="vertical" size={16} className="w-full">
      <Alert
        type="success"
        showIcon
        message="LES operations summary"
        description="Use tabs for setup, submission, automation, and run history. All LES work lives in this page."
      />

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Card className="glass-card">
            <Statistic title="Ready Trips" value={dashboardTotals.ready} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="glass-card">
            <Statistic title="Failed Trips" value={dashboardTotals.failed} valueStyle={{ color: "#b91c1c" }} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="glass-card">
            <Statistic title="LES Runs Today" value={submissionHistory.length} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="glass-card">
            <Statistic title="Auto Mode" value={autoSubmitEnabled ? "ON" : "OFF"} />
          </Card>
        </Col>
      </Row>

      <Card className="glass-card" title="Quick LES Actions">
        <Space wrap>
          <Button type="primary" icon={<SafetyOutlined />} onClick={() => setActiveLesTab("submission")}>
            Go to Submission
          </Button>
          <Button icon={<LinkOutlined />} onClick={() => setActiveLesTab("connections")}>
            Go to Connections
          </Button>
          <Button icon={<ClockCircleOutlined />} onClick={() => setActiveLesTab("automation")}>
            Go to Auto Mode
          </Button>
          <Button icon={<BarChartOutlined />} onClick={() => setActiveLesTab("history")}>
            Go to Run History
          </Button>
        </Space>
      </Card>
    </Space>
  );

  const renderLes = () => (
    <Space direction="vertical" size={16} className="w-full">
      <Card className="glass-card" title="LES Center Status">
        <Space wrap>
          <Space size={6}>
            <Typography.Text strong>LES:</Typography.Text>
            {connectionStatusTag(lesConnectionHealth)}
          </Space>
          <Tag color={autoSubmitEnabled ? "success" : "default"}>
            <ClockCircleOutlined /> Auto Mode {autoSubmitEnabled ? "On" : "Off"}
          </Tag>
          {hasLesConnectionIssue ? (
            <Tag color="error">Attention Required</Tag>
          ) : (
            <Tag color="success">All Connections Healthy</Tag>
          )}
        </Space>
      </Card>

      <Tabs
        activeKey={activeLesTab}
        onChange={(key) => setActiveLesTab(key as LesTabKey)}
        items={[
          { key: "overview", label: "Overview", children: renderLesOverview() },
          { key: "submission", label: "Submission", children: renderLesControl() },
          { key: "connections", label: "Connections", children: renderConnectors() },
          { key: "automation", label: "Auto Mode", children: renderAutomation() },
          {
            key: "history",
            label: "Run History",
            children: (
              <Card className="glass-card" title="LES Run History">
                <Table columns={submissionHistoryColumns} dataSource={submissionHistory} pagination={{ pageSize: 8 }} />
              </Card>
            ),
          },
        ]}
      />
    </Space>
  );

  const renderVehicles = () => (
    <Space direction="vertical" size={16} className="w-full">
      <Alert
        type="success"
        showIcon
        message="Vehicle operations"
        description="Use filters and row actions to manage assignment, status, and operational performance."
      />

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Card className="glass-card">
            <Statistic title="Total Vehicles" value={fleetStats.total} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="glass-card">
            <Statistic title="On Trip" value={fleetStats.onTrip} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="glass-card">
            <Statistic title="Idle" value={fleetStats.idle} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="glass-card">
            <Statistic title="Offline" value={fleetStats.offline} valueStyle={{ color: "#b45309" }} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="glass-card">
            <Statistic title="Off Service" value={fleetStats.offService} valueStyle={{ color: "#b45309" }} />
          </Card>
        </Col>
      </Row>

      <Card className="glass-card" title="Vehicle Controls">
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Search by plate, model, or driver"
              value={vehicleSearchText}
              onChange={(event) => setVehicleSearchText(event.target.value)}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              value={vehicleStatusFilter}
              onChange={(value: "ALL" | FleetVehicle["status"]) => setVehicleStatusFilter(value)}
              className="field-full"
              options={[
                { value: "ALL", label: "All Live Status" },
                { value: "ON_TRIP", label: "On Trip" },
                { value: "IDLE", label: "Idle" },
                { value: "OFFLINE", label: "Offline" },
              ]}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              value={vehicleOperationalFilter}
              onChange={(value: "ALL" | FleetVehicle["operationalStatus"]) => setVehicleOperationalFilter(value)}
              className="field-full"
              options={[
                { value: "ALL", label: "All Operational Status" },
                { value: "ACTIVE", label: "Active" },
                { value: "IN_SERVICE", label: "In Service" },
                { value: "UNDER_REPAIR", label: "Under Repair" },
                { value: "OFF_SERVICE", label: "Off Service" },
              ]}
            />
          </Col>
          <Col xs={24} md={4}>
            <Button type="primary" block onClick={openVehicleModalForCreate}>
              Add Vehicle
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="glass-card" title="Live Fleet Map (Simulated)">
        <div className="fleet-map">
          {filteredVehicles.slice(0, 50).map((vehicle) => (
            <Tooltip
              key={vehicle.key}
              title={`${vehicle.plate} · ${vehicle.captain} · ${vehicle.operationalStatus === "OFF_SERVICE" ? "Off Service" : vehicle.status === "ON_TRIP" ? "On Trip" : vehicle.status === "IDLE" ? "Idle" : "Offline"}`}
            >
              <span
                className={`fleet-marker fleet-marker--${vehicle.status.toLowerCase().replace("_", "-")}`}
                style={{ left: `${vehicle.x}%`, top: `${vehicle.y}%` }}
              />
            </Tooltip>
          ))}
        </div>
        <Space wrap className="top-gap">
          <Tag color="processing">Blue: On Trip</Tag>
          <Tag color="success">Green: Idle</Tag>
          <Tag color="default">Gray: Offline / Off Service</Tag>
        </Space>
      </Card>

      <Card className="glass-card" title="Vehicle Registry">
        <Table columns={fleetColumns} dataSource={filteredVehicles} pagination={{ pageSize: 8 }} />
      </Card>
      <Modal
        title={selectedVehicleKey ? "Edit Vehicle" : "Add Vehicle"}
        open={vehicleModalOpen}
        onCancel={() => {
          setVehicleModalOpen(false);
          setSelectedVehicleKey(null);
        }}
        onOk={() => void onSaveVehicle()}
        okText="Save Changes"
      >
        <Form form={vehicleForm} layout="vertical" requiredMark>
          <Form.Item label="Vehicle Plate" name="plate" rules={[{ required: true, message: "Vehicle plate is required." }]}>
            <Input placeholder="e.g. AUH-36210" />
          </Form.Item>
          <Form.Item label="Model" name="model" rules={[{ required: true, message: "Model is required." }]}>
            <Input placeholder="e.g. Toyota Camry" />
          </Form.Item>
          <Form.Item label="Year" name="year" rules={[{ required: true, message: "Year is required." }]}>
            <Input placeholder="e.g. 2024" />
          </Form.Item>
          <Form.Item label="VIN" name="vin" rules={[{ required: true, message: "VIN is required." }]}>
            <Input placeholder="Vehicle VIN" />
          </Form.Item>
          <Form.Item label="Tracker Unit" name="trackerName" rules={[{ required: true, message: "Tracker name is required." }]}>
            <Input placeholder="e.g. Unit-8101" />
          </Form.Item>
          <Form.Item label="Platform Mix" name="platformMix" rules={[{ required: true, message: "Platform mix is required." }]}>
            <Select
              options={platformMixSeed.map((item) => ({ value: item, label: item }))}
            />
          </Form.Item>
          <Form.Item
            label="Assigned Driver"
            name="captain"
            rules={[{ required: true, message: "Driver is required." }]}
          >
            <Select
              showSearch
              options={driverCompliance.map((driver) => ({ value: driver.name, label: driver.name }))}
            />
          </Form.Item>
          <Form.Item
            label="Live Status"
            name="status"
            rules={[{ required: true, message: "Status is required." }]}
          >
            <Select
              options={[
                { value: "ON_TRIP", label: "On Trip" },
                { value: "IDLE", label: "Idle" },
                { value: "OFFLINE", label: "Offline" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Operational Status"
            name="operationalStatus"
            rules={[{ required: true, message: "Status is required." }]}
            extra="Use In Service / Under Repair / Off Service when car is not operating."
          >
            <Select
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "IN_SERVICE", label: "In Service" },
                { value: "UNDER_REPAIR", label: "Under Repair" },
                { value: "OFF_SERVICE", label: "Off Service" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );

  const renderDrivers = () => (
    <Space direction="vertical" size={16} className="w-full">
      <Alert
        type="info"
        showIcon
        message="Driver compliance and identity"
        description="Add, edit, and update driver status (active, sick, on leave, left) with full compliance records."
      />

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card className="glass-card">
            <Statistic title="Drivers Valid" value={complianceStats.valid} valueStyle={{ color: "#166534" }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="glass-card">
            <Statistic title="Expiring Soon" value={complianceStats.expiring} valueStyle={{ color: "#b45309" }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="glass-card">
            <Statistic title="Missing Documents" value={complianceStats.missing} valueStyle={{ color: "#b91c1c" }} />
          </Card>
        </Col>
      </Row>

      <Card className="glass-card" title="Driver Controls">
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Search by name, Emirates ID, or vehicle"
              value={driverSearchText}
              onChange={(event) => setDriverSearchText(event.target.value)}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              value={driverStatusFilter}
              onChange={(value: "ALL" | DriverCompliance["status"]) => setDriverStatusFilter(value)}
              className="field-full"
              options={[
                { value: "ALL", label: "All Driver Status" },
                { value: "ACTIVE", label: "Active" },
                { value: "SICK", label: "Sick" },
                { value: "ON_LEAVE", label: "On Leave" },
                { value: "LEFT", label: "Left Business" },
              ]}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              value={driverComplianceFilter}
              onChange={(value: "ALL" | DriverCompliance["compliance"]) => setDriverComplianceFilter(value)}
              className="field-full"
              options={[
                { value: "ALL", label: "All Compliance" },
                { value: "VALID", label: "Valid" },
                { value: "EXPIRING_SOON", label: "Expiring Soon" },
                { value: "MISSING", label: "Missing" },
              ]}
            />
          </Col>
          <Col xs={24} md={4}>
            <Button type="primary" block onClick={openDriverModalForCreate}>
              Add Driver
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="glass-card" title="Driver Registry">
        <Table columns={driverComplianceColumns} dataSource={filteredDrivers} pagination={{ pageSize: 8 }} />
      </Card>

      <Modal
        title={selectedDriverKey ? "Edit Driver" : "Add Driver"}
        open={driverModalOpen}
        onCancel={() => {
          setDriverModalOpen(false);
          setSelectedDriverKey(null);
        }}
        onOk={() => void onSaveDriver()}
        okText="Save Driver"
      >
        <Form form={driverForm} layout="vertical" requiredMark>
          <Form.Item label="Full Name" name="name" rules={[{ required: true, message: "Driver name is required." }]}>
            <Input placeholder="Driver full name" />
          </Form.Item>
          <Form.Item label="Emirates ID" name="emiratesId" rules={[{ required: true, message: "Emirates ID is required." }]}>
            <Input placeholder="784-xxxx-xxxxxxx-x" />
          </Form.Item>
          <Form.Item label="Driving License No." name="licenseNo" rules={[{ required: true, message: "License number is required." }]}>
            <Input placeholder="DL-AUH-xxxxxx" />
          </Form.Item>
          <Form.Item label="Limousine Permit No." name="permitNo" rules={[{ required: true, message: "Permit number is required." }]}>
            <Input placeholder="LIMO-xxxxxx" />
          </Form.Item>
          <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Phone is required." }]}>
            <Input placeholder="+971 xx xxx xxxx" />
          </Form.Item>
          <Form.Item label="Assigned Vehicle" name="assignedPlate" extra="Optional for drivers not currently assigned.">
            <Select
              allowClear
              showSearch
              options={fleetVehicles.map((vehicle) => ({ value: vehicle.plate, label: `${vehicle.plate} - ${vehicle.model}` }))}
            />
          </Form.Item>
          <Form.Item label="Driver Status" name="status" rules={[{ required: true, message: "Status is required." }]}>
            <Select
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "SICK", label: "Sick" },
                { value: "ON_LEAVE", label: "On Leave" },
                { value: "LEFT", label: "Left Business" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Compliance Status" name="compliance" rules={[{ required: true, message: "Compliance status is required." }]}>
            <Select
              options={[
                { value: "VALID", label: "Valid" },
                { value: "EXPIRING_SOON", label: "Expiring Soon" },
                { value: "MISSING", label: "Missing" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );

  const renderFinance = () => (
    <Space direction="vertical" size={16} className="w-full">
      <Alert
        type="info"
        showIcon
        message="Financial operations"
        description="Captain earnings and expense ledger are separated into tabs. Add and edit expenses from modal only."
      />

      <Tabs
        activeKey={activeFinanceTab}
        onChange={(key) => setActiveFinanceTab(key as FinanceTabKey)}
        items={[
          {
            key: "earnings",
            label: "Captain Earnings",
            children: (
              <Space direction="vertical" size={16} className="w-full">
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Card className="glass-card">
                      <Statistic title="Total Earnings (AED)" value={financeTotals.totalEarnings} precision={2} />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card className="glass-card">
                      <Statistic title="Payouts (AED)" value={financeTotals.payouts} precision={2} />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card className="glass-card">
                      <Statistic title="Net After Ops (AED)" value={financeTotals.netAfterOps} precision={2} valueStyle={{ color: financeTotals.netAfterOps >= 0 ? "#166534" : "#b91c1c" }} />
                    </Card>
                  </Col>
                </Row>

                <Card className="glass-card" title="Captain Earnings Filters">
                  <Row gutter={12}>
                    <Col xs={24} md={12}>
                      <Input
                        placeholder="Search captain or assigned vehicle"
                        value={captainSearchText}
                        onChange={(event) => setCaptainSearchText(event.target.value)}
                      />
                    </Col>
                    <Col xs={24} md={8}>
                      <Select
                        value={captainStatusFilter}
                        onChange={(value: "ALL" | DriverCompliance["status"]) => setCaptainStatusFilter(value)}
                        className="field-full"
                        options={[
                          { value: "ALL", label: "All Captain Status" },
                          { value: "ACTIVE", label: "Active" },
                          { value: "SICK", label: "Sick" },
                          { value: "ON_LEAVE", label: "On Leave" },
                          { value: "LEFT", label: "Left Business" },
                        ]}
                      />
                    </Col>
                    <Col xs={24} md={4}>
                      <Button
                        block
                        onClick={() => {
                          setCaptainSearchText("");
                          setCaptainStatusFilter("ALL");
                        }}
                      >
                        Reset
                      </Button>
                    </Col>
                  </Row>
                </Card>

                <Card className="glass-card" title="Captain Earnings Table">
                  <Table columns={captainEarningsColumns} dataSource={filteredCaptainEarnings} pagination={{ pageSize: 8 }} />
                </Card>
              </Space>
            ),
          },
          {
            key: "expenses",
            label: "Expense Ledger",
            children: (
              <Space direction="vertical" size={16} className="w-full">
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Card className="glass-card">
                      <Statistic title="Operating Costs (AED)" value={financeTotals.operatingExpenses} precision={2} valueStyle={{ color: "#b45309" }} />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card className="glass-card">
                      <Statistic title="Refunds/Expenses (AED)" value={financeTotals.refundsExpenses} precision={2} />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card className="glass-card">
                      <Statistic title="Expenses Recorded" value={expenses.length} />
                    </Card>
                  </Col>
                </Row>

                <Card className="glass-card" title="Expense Controls">
                  <Row gutter={12}>
                    <Col xs={24} md={8}>
                      <Input
                        placeholder="Search notes, vehicle, or driver"
                        value={expenseSearchText}
                        onChange={(event) => setExpenseSearchText(event.target.value)}
                      />
                    </Col>
                    <Col xs={24} md={6}>
                      <Select
                        value={expenseCategoryFilter}
                        onChange={(value: "ALL" | ExpenseCategory) => setExpenseCategoryFilter(value)}
                        className="field-full"
                        options={[
                          { value: "ALL", label: "All Categories" },
                          { value: "FUEL", label: "Fuel" },
                          { value: "BREAKDOWN", label: "Breakdown" },
                          { value: "FINE", label: "Fine" },
                          { value: "MAINTENANCE", label: "Maintenance" },
                          { value: "INSURANCE", label: "Insurance" },
                          { value: "OTHER", label: "Other" },
                        ]}
                      />
                    </Col>
                    <Col xs={24} md={6}>
                      <Select
                        value={expenseVehicleFilter}
                        onChange={(value: "ALL" | string) => setExpenseVehicleFilter(value)}
                        className="field-full"
                        options={[
                          { value: "ALL", label: "All Vehicles" },
                          ...fleetVehicles.map((vehicle) => ({
                            value: vehicle.plate,
                            label: vehicle.plate,
                          })),
                        ]}
                      />
                    </Col>
                    <Col xs={24} md={4}>
                      <Button type="primary" block onClick={openExpenseModalForCreate}>
                        Add Expense
                      </Button>
                    </Col>
                  </Row>
                </Card>

                <Card className="glass-card" title="Expense Ledger">
                  <Table columns={expenseColumns} dataSource={filteredExpenses} pagination={{ pageSize: 8 }} />
                </Card>
              </Space>
            ),
          },
          {
            key: "whatsapp",
            label: "WhatsApp Intake",
            children: (
              <Space direction="vertical" size={16} className="w-full">
                <Row gutter={16}>
                  <Col xs={24} md={6}>
                    <Card className="glass-card">
                      <Statistic title="Inbox" value={whatsAppInboxStats.total} />
                    </Card>
                  </Col>
                  <Col xs={24} md={6}>
                    <Card className="glass-card">
                      <Statistic title="Pending AI Review" value={whatsAppInboxStats.pending} valueStyle={{ color: "#b45309" }} />
                    </Card>
                  </Col>
                  <Col xs={24} md={6}>
                    <Card className="glass-card">
                      <Statistic title="Ready for Approval" value={whatsAppInboxStats.reviewed} valueStyle={{ color: "#0369a1" }} />
                    </Card>
                  </Col>
                  <Col xs={24} md={6}>
                    <Card className="glass-card">
                      <Statistic title="Approved" value={whatsAppInboxStats.approved} valueStyle={{ color: "#166534" }} />
                    </Card>
                  </Col>
                </Row>

                <Card className="glass-card" title="WhatsApp Receipt Workflow">
                  <Typography.Paragraph className="bottom-zero">
                    {"Driver sends receipt on WhatsApp -> operator can view shared image or attach one manually -> AI extracts data -> operator approves -> entry is posted to expense ledger."}
                  </Typography.Paragraph>
                </Card>

                <Card className="glass-card" title="Inbox Filters">
                  <Row gutter={12}>
                    <Col xs={24} md={10}>
                      <Input
                        placeholder="Search by driver, phone, plate, merchant, or receipt no."
                        value={whatsAppSearchText}
                        onChange={(event) => setWhatsAppSearchText(event.target.value)}
                      />
                    </Col>
                    <Col xs={24} md={8}>
                      <Select
                        value={whatsAppStatusFilter}
                        onChange={(value: "ALL" | WhatsAppReceiptStatus) => setWhatsAppStatusFilter(value)}
                        className="field-full"
                        options={[
                          { value: "ALL", label: "All Status" },
                          { value: "NEW", label: "New" },
                          { value: "AI_REVIEWED", label: "AI Reviewed" },
                          { value: "APPROVED", label: "Approved" },
                          { value: "REJECTED", label: "Rejected" },
                        ]}
                      />
                    </Col>
                    <Col xs={24} md={6}>
                      <Button
                        block
                        onClick={() => {
                          setWhatsAppSearchText("");
                          setWhatsAppStatusFilter("ALL");
                        }}
                      >
                        Reset
                      </Button>
                    </Col>
                  </Row>
                </Card>

                <Card className="glass-card" title="WhatsApp Receipt Inbox">
                  <Table columns={whatsAppReceiptColumns} dataSource={filteredWhatsAppReceipts} pagination={{ pageSize: 8 }} />
                </Card>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={selectedExpenseKey ? "Edit Expense" : "Add Expense"}
        open={expenseModalOpen}
        onCancel={() => {
          setExpenseModalOpen(false);
          setSelectedExpenseKey(null);
        }}
        onOk={() => void onSaveExpense()}
        okText="Save Expense"
      >
        <Form form={expenseForm} layout="vertical" requiredMark>
          <Form.Item label="Date" name="date" rules={[{ required: true, message: "Date is required." }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Category" name="category" rules={[{ required: true, message: "Category is required." }]}>
            <Select
              options={[
                { value: "FUEL", label: "Fuel" },
                { value: "BREAKDOWN", label: "Breakdown" },
                { value: "FINE", label: "Fine" },
                { value: "MAINTENANCE", label: "Maintenance" },
                { value: "INSURANCE", label: "Insurance" },
                { value: "OTHER", label: "Other" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Vehicle Plate" name="vehiclePlate" rules={[{ required: true, message: "Vehicle plate is required." }]}>
            <Select
              showSearch
              options={fleetVehicles.map((vehicle) => ({ value: vehicle.plate, label: `${vehicle.plate} - ${vehicle.model}` }))}
            />
          </Form.Item>
          <Form.Item label="Driver (optional)" name="driverName">
            <Select
              allowClear
              showSearch
              options={driverCompliance.map((driver) => ({ value: driver.name, label: driver.name }))}
            />
          </Form.Item>
          <Form.Item label="Amount (AED)" name="amount" rules={[{ required: true, message: "Amount is required." }]}>
            <Input placeholder="e.g. 250.75" />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input placeholder="Short reason or reference" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="WhatsApp Receipt Review"
        open={whatsAppModalOpen}
        onCancel={() => {
          setWhatsAppModalOpen(false);
          setSelectedWhatsAppReceiptKey(null);
        }}
        footer={
          selectedWhatsAppReceipt
            ? [
                <Button
                  key="ai"
                  loading={aiReviewingReceiptKey === selectedWhatsAppReceipt.key}
                  disabled={selectedWhatsAppReceipt.status === "APPROVED"}
                  onClick={() => void runAiReviewOnReceipt(selectedWhatsAppReceipt.key)}
                >
                  Run AI Review
                </Button>,
                <Upload key="attach" {...whatsAppAttachmentUploadProps(selectedWhatsAppReceipt.key)}>
                  <Button icon={<PaperClipOutlined />}>
                    {selectedWhatsAppReceipt.attachmentUrl ? "Replace Receipt Image" : "Attach Receipt Image"}
                  </Button>
                </Upload>,
                <Button
                  key="reject"
                  danger
                  disabled={selectedWhatsAppReceipt.status === "APPROVED" || selectedWhatsAppReceipt.status === "REJECTED"}
                  loading={receiptActionLoadingKey === selectedWhatsAppReceipt.key}
                  onClick={() => void rejectWhatsAppReceipt(selectedWhatsAppReceipt.key)}
                >
                  Reject
                </Button>,
                <Button
                  key="approve"
                  type="primary"
                  disabled={selectedWhatsAppReceipt.status === "APPROVED" || selectedWhatsAppReceipt.status === "REJECTED"}
                  loading={receiptActionLoadingKey === selectedWhatsAppReceipt.key}
                  onClick={() => void approveWhatsAppReceipt(selectedWhatsAppReceipt.key)}
                >
                  Approve to Expense
                </Button>,
              ]
            : undefined
        }
      >
        {selectedWhatsAppReceipt ? (
          <Space direction="vertical" size={10} className="w-full">
            <Row gutter={10}>
              <Col span={12}><Typography.Text type="secondary">Driver</Typography.Text><div>{selectedWhatsAppReceipt.driverName}</div></Col>
              <Col span={12}><Typography.Text type="secondary">Phone</Typography.Text><div>{selectedWhatsAppReceipt.driverPhone}</div></Col>
              <Col span={12}><Typography.Text type="secondary">Vehicle</Typography.Text><div>{selectedWhatsAppReceipt.vehiclePlate}</div></Col>
              <Col span={12}><Typography.Text type="secondary">Date</Typography.Text><div>{selectedWhatsAppReceipt.date}</div></Col>
              <Col span={12}><Typography.Text type="secondary">Merchant</Typography.Text><div>{selectedWhatsAppReceipt.merchant}</div></Col>
              <Col span={12}><Typography.Text type="secondary">Receipt #</Typography.Text><div>{selectedWhatsAppReceipt.receiptNo}</div></Col>
              <Col span={12}><Typography.Text type="secondary">Category</Typography.Text><div>{selectedWhatsAppReceipt.category}</div></Col>
              <Col span={12}><Typography.Text type="secondary">Amount</Typography.Text><div>AED {selectedWhatsAppReceipt.amount.toFixed(2)}</div></Col>
            </Row>
            <Alert
              type={selectedWhatsAppReceipt.confidence >= 85 ? "success" : selectedWhatsAppReceipt.confidence >= 70 ? "warning" : "error"}
              showIcon
              message={`AI Confidence: ${selectedWhatsAppReceipt.confidence}%`}
              description={selectedWhatsAppReceipt.aiNotes}
            />
            <Card size="small" title="Receipt Attachment">
              <Space direction="vertical" size={8} className="w-full">
                {selectedWhatsAppReceipt.attachmentUrl ? (
                  <>
                    <Image
                      src={selectedWhatsAppReceipt.attachmentUrl}
                      alt={selectedWhatsAppReceipt.attachmentName ?? `${selectedWhatsAppReceipt.receiptNo}.jpg`}
                      style={{ width: "100%", maxHeight: 260, objectFit: "contain", borderRadius: 10, border: "1px solid #e5e7eb" }}
                    />
                    <Space wrap>
                      <Tag color={selectedWhatsAppReceipt.attachmentSource === "WHATSAPP" ? "green" : "blue"}>
                        {selectedWhatsAppReceipt.attachmentSource === "WHATSAPP" ? "WhatsApp shared image" : "Manually attached"}
                      </Tag>
                      <Typography.Text type="secondary">
                        File: {selectedWhatsAppReceipt.attachmentName ?? "receipt-image.jpg"}
                      </Typography.Text>
                    </Space>
                  </>
                ) : (
                  <Alert
                    type="warning"
                    showIcon
                    message="No receipt image attached yet"
                    description="Click Attach Receipt Image to upload a photo or screenshot from WhatsApp."
                  />
                )}
              </Space>
            </Card>
            <Typography.Text type="secondary">Purpose: {selectedWhatsAppReceipt.purpose}</Typography.Text>
            <Tag color={selectedWhatsAppReceipt.status === "APPROVED" ? "success" : selectedWhatsAppReceipt.status === "REJECTED" ? "error" : "processing"}>
              {selectedWhatsAppReceipt.status}
            </Tag>
          </Space>
        ) : null}
      </Modal>
    </Space>
  );

  const renderReports = () => (
    <Space direction="vertical" size={16} className="w-full">
      <Alert
        type="success"
        showIcon
        message="Report center"
        description="Run driver and vehicle performance reports with filters, then generate formal exports."
      />

      <Card className="glass-card" title="Generate New Report">
        <Space wrap>
          <Button type="primary" icon={<FileDoneOutlined />} onClick={() => void onGenerateReport("Daily LES Submission Report")}>
            Daily LES Submission
          </Button>
          <Button icon={<FileDoneOutlined />} onClick={() => void onGenerateReport("Platform Exceptions Report")}>
            Platform Exceptions
          </Button>
          <Button icon={<FileDoneOutlined />} onClick={() => void onGenerateReport("Fleet Utilization Report")}>
            Fleet Utilization
          </Button>
          <Button icon={<FileDoneOutlined />} onClick={() => void onGenerateReport("Captain Earnings Report")}>
            Captain Earnings
          </Button>
        </Space>
      </Card>

      <Card className="glass-card" title="Recent Reports">
        <Table columns={reportColumns} dataSource={reportJobs} pagination={{ pageSize: 6 }} />
      </Card>

      <Card className="glass-card" title="Driver Performance Report">
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Select
              value={reportDriverStatusFilter}
              onChange={(value: "ALL" | DriverCompliance["status"]) => setReportDriverStatusFilter(value)}
              className="field-full"
              options={[
                { value: "ALL", label: "All Driver Status" },
                { value: "ACTIVE", label: "Active" },
                { value: "SICK", label: "Sick" },
                { value: "ON_LEAVE", label: "On Leave" },
                { value: "LEFT", label: "Left Business" },
              ]}
            />
          </Col>
          <Col xs={24} md={16}>
            <Typography.Text type="secondary">Filter by driver status to review performance by workforce availability.</Typography.Text>
          </Col>
        </Row>
        <div className="top-gap">
          <Table columns={driverPerformanceColumns} dataSource={driverPerformanceRows} pagination={{ pageSize: 6 }} />
        </div>
      </Card>

      <Card className="glass-card" title="Vehicle Operational Performance">
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Select
              value={reportVehicleOperationalFilter}
              onChange={(value: "ALL" | FleetVehicle["operationalStatus"]) => setReportVehicleOperationalFilter(value)}
              className="field-full"
              options={[
                { value: "ALL", label: "All Operational Status" },
                { value: "ACTIVE", label: "Active" },
                { value: "IN_SERVICE", label: "In Service" },
                { value: "UNDER_REPAIR", label: "Under Repair" },
                { value: "OFF_SERVICE", label: "Off Service" },
              ]}
            />
          </Col>
          <Col xs={24} md={16}>
            <Typography.Text type="secondary">Review on-road/off-road time and utilization for each vehicle.</Typography.Text>
          </Col>
        </Row>
        <div className="top-gap">
          <Table columns={vehiclePerformanceColumns} dataSource={vehiclePerformanceRows} pagination={{ pageSize: 6 }} />
        </div>
      </Card>
    </Space>
  );

  const renderSettings = () => (
    <Space direction="vertical" size={16} className="w-full">
      <Alert
        type="info"
        showIcon
        message="Company and notification settings"
        description="Keep contact details current so connection failures and LES exceptions reach the right person."
      />

      <Card className="glass-card" title="Company Profile">
        <Form
          form={companyForm}
          layout="vertical"
          requiredMark
          initialValues={{
            companyName: "Twenty Four Seven Rides Limousine",
            contactName: "Operations Manager",
            contactEmail: "ops@company.ae",
            contactPhone: "+971 50 000 0000",
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Company Name"
                name="companyName"
                rules={[{ required: true, message: "Company name is required." }]}
              >
                <Input placeholder="Company legal name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Primary Contact"
                name="contactName"
                rules={[{ required: true, message: "Primary contact is required." }]}
              >
                <Input placeholder="Main operator name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="contactEmail"
                rules={[{ required: true, message: "Email is required." }]}
              >
                <Input placeholder="Email address" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Phone"
                name="contactPhone"
                rules={[{ required: true, message: "Phone is required." }]}
              >
                <Input placeholder="Phone number" />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" onClick={() => void saveCompanySettings()}>Save Company Profile</Button>
        </Form>
      </Card>

      <Card className="glass-card" title="Notifications">
        <Space direction="vertical" size={12} className="w-full">
          <Space wrap>
            <Typography.Text strong>Daily summary email</Typography.Text>
            <Switch checked={dailyDigestEnabled} onChange={setDailyDigestEnabled} />
          </Space>
          <Space wrap>
            <Typography.Text strong>SMS alert on LES failure</Typography.Text>
            <Switch checked={smsAlertEnabled} onChange={setSmsAlertEnabled} />
          </Space>
          <Typography.Text type="secondary">
            Alerts are simulated in this prototype and mimic production notification behavior.
          </Typography.Text>
        </Space>
      </Card>
    </Space>
  );

  const renderContent = () => {
    if (activeMenu === "les") return renderLes();
    if (activeMenu === "vehicles") return renderVehicles();
    if (activeMenu === "drivers") return renderDrivers();
    if (activeMenu === "finance") return renderFinance();
    if (activeMenu === "reports") return renderReports();
    if (activeMenu === "settings") return renderSettings();
    return renderDashboard();
  };

  const profileMenuItems: MenuProps["items"] = [
    {
      key: "account",
      icon: <UserOutlined />,
      label: "My Account",
    },
    {
      key: "company",
      icon: <SettingOutlined />,
      label: "Company Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0b6e4f",
          colorInfo: "#0f766e",
          borderRadius: 14,
          fontFamily: "'Avenir Next', 'Segoe UI', sans-serif",
        },
        components: {
          Layout: {
            headerBg: "rgba(255,255,255,0.82)",
            siderBg: "#0f1f2b",
            triggerBg: "#0f1f2b",
          },
          Card: {
            borderRadiusLG: 16,
          },
          Menu: {
            darkItemBg: "#0f1f2b",
            darkItemSelectedBg: "#14532d",
            darkSubMenuItemBg: "#0f1f2b",
          },
        },
      }}
    >
      <AntdApp>
        {contextHolder}

        {!isAuthenticated ? (
          <div className="login-shell">
            <Card className="glass-card login-card">
              <Space direction="vertical" size={12} className="w-full">
                <Typography.Title level={3} className="header-title">
                  Carmak
                </Typography.Title>
                <Typography.Text type="secondary">Sign in to continue to your operations command center.</Typography.Text>

                <Form form={loginForm} layout="vertical" requiredMark onFinish={() => void onLogin()}>
                  <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: "Username is required." }]}
                  >
                    <Input placeholder="Username" autoComplete="username" />
                  </Form.Item>
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Password is required." }]}
                  >
                    <Input.Password placeholder="Password" autoComplete="current-password" />
                  </Form.Item>
                  <Button type="primary" size="large" htmlType="submit" block>
                    Login
                  </Button>
                </Form>
              </Space>
            </Card>
          </div>
        ) : (
          <>
            <Layout className="app-root">
              <Layout.Sider
                className="primary-sider"
                width={286}
                collapsedWidth={84}
                collapsible
                trigger={null}
                collapsed={navCollapsed}
              >
                <div className={`brand ${navCollapsed ? "brand--collapsed" : ""}`}>
                  <div>
                    <Typography.Title level={4} className="brand-title">
                      {navCollapsed ? "C" : "Carmak"}
                    </Typography.Title>
                    {!navCollapsed ? (
                      <Typography.Text className="brand-subtitle">Unified Limousine Operations Platform</Typography.Text>
                    ) : null}
                  </div>
                  <Button
                    type="text"
                    className="sider-toggle-btn"
                    icon={navCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setNavCollapsed((previous) => !previous)}
                    aria-label={navCollapsed ? "Expand navigation" : "Collapse navigation"}
                  />
                </div>

                <Menu
                  theme="dark"
                  mode="inline"
                  inlineCollapsed={navCollapsed}
                  selectedKeys={[activeMenu]}
                  items={menuItems}
                  onClick={(event) => setActiveMenu(event.key as MenuKey)}
                />
              </Layout.Sider>

              <Layout>
                <Layout.Header className="header">
                  <Space direction="vertical" size={0} className="header-copy">
                    <Typography.Title level={3} className="header-title">
                      {sectionMeta[activeMenu].title}
                    </Typography.Title>
                    <Typography.Text type="secondary">{sectionMeta[activeMenu].subtitle}</Typography.Text>
                  </Space>

                  <Space wrap>
                    <Tooltip title="Open failures needing action">
                      <Button icon={<WarningOutlined />} onClick={() => openLesSection("submission")}>
                        {unresolvedFailedCount} Issues
                      </Button>
                    </Tooltip>

                    <Tooltip title="Alerts">
                      <Button icon={<BellOutlined />}>Alerts</Button>
                    </Tooltip>

                    <Dropdown menu={{ items: profileMenuItems, onClick: onProfileAction }} trigger={["click"]}>
                      <Button className="profile-menu-btn">
                        <Space size={8}>
                          <Avatar size={26} icon={<UserOutlined />} />
                          <span>Profile</span>
                          <DownOutlined />
                        </Space>
                      </Button>
                    </Dropdown>
                  </Space>
                </Layout.Header>

                <Layout.Content className="content">{renderContent()}</Layout.Content>
              </Layout>
            </Layout>

            <Modal
              title="Submitting Trips to LES"
              open={lesModalOpen}
              maskClosable={!lesSubmitting}
              closable={!lesSubmitting}
              onCancel={() => {
                if (!lesSubmitting) setLesModalOpen(false);
              }}
              footer={
                lesSubmitting
                  ? [
                      <Button key="submitting" loading disabled>
                        Submitting...
                      </Button>,
                    ]
                  : [
                      lesSummary.failed > 0 ? (
                        <Button
                          key="resubmit"
                          icon={<SyncOutlined />}
                          onClick={() => void runLesSubmissionSimulation({ type: "failed-all" })}
                        >
                          Resubmit Failed Trips
                        </Button>
                      ) : null,
                      <Button key="close" onClick={() => setLesModalOpen(false)}>
                        Close
                      </Button>,
                      <Button
                        key="receipt"
                        type="primary"
                        onClick={() => api.success("Submission receipt download will be connected next.")}
                      >
                        Download Submission Receipt
                      </Button>,
                    ]
              }
            >
              <Space direction="vertical" size={14} className="w-full">
                <Typography.Text strong>
                  Trips in this run: {lesSummary.ready} | Submitted: {lesSummary.submitted} | Failed: {lesSummary.failed}
                </Typography.Text>

                {lesLikelyFailureReasons.length > 0 && (
                  <Alert
                    type="warning"
                    showIcon
                    message="Most likely failure reasons"
                    description={
                      <div>
                        {lesLikelyFailureReasons.map((item) => (
                          <div key={item.reason}>
                            {item.reason} ({item.count} trip{item.count > 1 ? "s" : ""})
                          </div>
                        ))}
                      </div>
                    }
                  />
                )}

                <Progress
                  percent={lesProgress}
                  status={lesFailedStageIndex !== null ? "exception" : lesSubmitting ? "active" : "success"}
                />

                <Steps
                  direction="vertical"
                  size="small"
                  current={lesCurrentStage}
                  items={lesSubmissionStages.map((title, index) => {
                    if (lesFailedStageIndex !== null) {
                      if (index < lesFailedStageIndex) return { title, status: "finish" as const };
                      if (index === lesFailedStageIndex) return { title, status: "error" as const };
                      return { title, status: "wait" as const };
                    }
                    if (lesSubmitting) {
                      if (index < lesCurrentStage) return { title, status: "finish" as const };
                      if (index === lesCurrentStage) return { title, status: "process" as const };
                      return { title, status: "wait" as const };
                    }
                    return { title, status: "finish" as const };
                  })}
                />

                <div className="submission-log-box">
                  {lesSubmissionLog.map((line, index) => (
                    <div key={`${line}-${index}`}>{line}</div>
                  ))}
                </div>
              </Space>
            </Modal>
          </>
        )}
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
