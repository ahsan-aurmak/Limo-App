import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Card,
  Chip,
  Divider,
  MD3DarkTheme,
  PaperProvider,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { demoDriver, initialBookings } from "./src/mockData";
import { Booking, Screen } from "./src/types";

type PassengerDraft = {
  customerName: string;
  customerMobileNumber: string;
  nationality: string;
  emiratesIdNumber: string;
  passportNumber: string;
};

const emptyDraft: PassengerDraft = {
  customerName: "",
  customerMobileNumber: "",
  nationality: "",
  emiratesIdNumber: "",
  passportNumber: "",
};

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4CC9B0",
    secondary: "#FFB86B",
    tertiary: "#FF7C70",
    background: "#0E141B",
    surface: "#151D26",
    surfaceVariant: "#1C2631",
    outline: "#314152",
    error: "#FF8A80",
  },
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(initialBookings[0]?.id ?? "");
  const [passengerDraft, setPassengerDraft] = useState<PassengerDraft>(emptyDraft);

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [bookings, selectedBookingId]
  );

  const needsActionCount = bookings.filter((booking) => booking.bookingStatus !== "passenger_verified").length;
  const checkedCount = bookings.filter((booking) => booking.bookingStatus === "passenger_verified").length;
  const pendingSyncCount = bookings.filter((booking) => booking.syncStatus === "pending").length;

  const handleLogin = () => {
    setScreen("home");
  };

  const openBooking = (bookingId: string) => {
    const booking = bookings.find((item) => item.id === bookingId);
    setSelectedBookingId(bookingId);
    setPassengerDraft({
      customerName:
        booking?.customerName === "Passenger details not provided" ? "" : booking?.customerName ?? "",
      customerMobileNumber: booking?.customerMobileNumber ?? "",
      nationality: booking?.nationality ?? "",
      emiratesIdNumber: booking?.emiratesIdNumber ?? "",
      passportNumber: booking?.passportNumber ?? "",
    });
    setScreen("booking");
  };

  const savePassengerDetails = () => {
    if (!selectedBooking) {
      return;
    }

    if (selectedBooking.bookingStatus === "assigned") {
      Alert.alert(
        "Wait until passenger is in the car",
        "Passenger details should only be added after the passenger is in the car."
      );
      return;
    }

    if (
      !passengerDraft.customerName ||
      !passengerDraft.customerMobileNumber ||
      !passengerDraft.nationality ||
      (!passengerDraft.emiratesIdNumber && !passengerDraft.passportNumber)
    ) {
      Alert.alert(
        "Missing passenger details",
        "Enter passenger name, mobile number, nationality, and Emirates ID or passport number."
      );
      return;
    }

    setBookings((current) =>
      current.map((booking) =>
        booking.id === selectedBooking.id
          ? {
              ...booking,
              customerName: passengerDraft.customerName,
              customerMobileNumber: passengerDraft.customerMobileNumber,
              nationality: passengerDraft.nationality,
              emiratesIdNumber: passengerDraft.emiratesIdNumber || undefined,
              passportNumber: passengerDraft.passportNumber || undefined,
              syncStatus: "pending",
            }
          : booking
      )
    );

    Alert.alert("Passenger details saved", "The app will sync these details in the background.");
  };

  const verifyPassenger = () => {
    if (!selectedBooking) {
      return;
    }

    if (selectedBooking.bookingStatus === "assigned") {
      Alert.alert(
        "Mark passenger in car first",
        "Tap Passenger in car before verifying passenger details."
      );
      return;
    }

    const nameReady =
      passengerDraft.customerName ||
      (selectedBooking.customerName && selectedBooking.customerName !== "Passenger details not provided");
    const mobileReady = passengerDraft.customerMobileNumber || selectedBooking.customerMobileNumber;
    const nationalityReady = passengerDraft.nationality || selectedBooking.nationality;
    const identityReady =
      passengerDraft.emiratesIdNumber ||
      passengerDraft.passportNumber ||
      selectedBooking.emiratesIdNumber ||
      selectedBooking.passportNumber;

    if (!nameReady || !mobileReady || !nationalityReady || !identityReady) {
      Alert.alert(
        "Passenger not ready",
        "Complete the missing passenger details before verifying passenger."
      );
      return;
    }

    setBookings((current) =>
      current.map((booking) =>
        booking.id === selectedBooking.id
          ? {
              ...booking,
              customerName: passengerDraft.customerName || booking.customerName,
              customerMobileNumber: passengerDraft.customerMobileNumber || booking.customerMobileNumber,
              nationality: passengerDraft.nationality || booking.nationality,
              emiratesIdNumber: passengerDraft.emiratesIdNumber || booking.emiratesIdNumber,
              passportNumber: passengerDraft.passportNumber || booking.passportNumber,
              bookingStatus: "passenger_verified",
              syncStatus: "pending",
            }
          : booking
      )
    );

    Alert.alert("Passenger verified", "Verification is saved and will sync in the background.");
    setScreen("home");
  };

  const markPassengerInCar = () => {
    if (!selectedBooking) {
      return;
    }

    setBookings((current) =>
      current.map((booking) =>
        booking.id === selectedBooking.id
          ? {
              ...booking,
              bookingStatus: "arrived",
            }
          : booking
      )
    );

    Alert.alert("Passenger in car", "You can now add missing passenger details and verify the passenger.");
  };

  const logout = () => setScreen("login");

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0E141B" />
        {screen === "login" ? (
          <KeyboardAvoidingView
            style={styles.loginShell}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <Card mode="elevated" style={styles.loginCard}>
              <Card.Content style={styles.loginCardContent}>
                <Chip compact style={styles.loginChip}>
                  Driver app
                </Chip>
                <Text variant="headlineMedium" style={styles.loginTitle}>
                  Passenger pickup check-in
                </Text>
                <Text variant="bodyLarge" style={styles.loginBody}>
                  Open the assigned pickup, mark when the passenger is in the car, then complete the passenger details.
                </Text>
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  contentStyle={styles.primaryButtonContent}
                  labelStyle={styles.ctaLabel}
                >
                  Login
                </Button>
                <Surface elevation={0} style={styles.testingPanel}>
                  <Text variant="titleSmall" style={styles.testingTitle}>
                    Testing mode
                  </Text>
                  <Text variant="bodyMedium" style={styles.testingBody}>
                    This preview opens directly so users can test the flow without credentials.
                  </Text>
                </Surface>
              </Card.Content>
            </Card>
          </KeyboardAvoidingView>
        ) : (
          <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
            {screen === "home" ? (
              <>
                <Header
                  title="Today's pickups"
                  subtitle="Drivers only need the pickup, the passenger status, and the in-car check-in."
                  onLogout={logout}
                />

                <Surface style={styles.heroSurface} elevation={1}>
                  <Text variant="titleLarge" style={styles.heroName}>
                    {demoDriver.name}
                  </Text>
                  <Text variant="bodyMedium" style={styles.heroMeta}>
                    Vehicle {demoDriver.assignedVehicle}
                  </Text>
                  <View style={styles.heroStatsRow}>
                    <MetricCard label="Need action" value={needsActionCount} />
                    <MetricCard label="Checked" value={checkedCount} />
                  </View>
                </Surface>

                <Surface style={styles.syncSurface} elevation={0}>
                  <Chip
                    compact
                    mode="flat"
                  >
                    {pendingSyncCount > 0
                      ? `${pendingSyncCount} update(s) syncing in background`
                      : "All updates synced"}
                  </Chip>
                </Surface>

                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Pickups
                </Text>

                {bookings.map((booking) => {
                  const missingPassengerDetails =
                    !booking.customerMobileNumber ||
                    !booking.nationality ||
                    (!booking.emiratesIdNumber && !booking.passportNumber) ||
                    booking.customerName === "Passenger details not provided";
                  const countdown = getPickupCountdown(booking.pickupTimeLocal);

                  return (
                    <Pressable key={booking.id} onPress={() => openBooking(booking.id)}>
                      <Card mode="elevated" style={styles.bookingCard}>
                        <Card.Content style={styles.bookingCardContent}>
                          <View style={styles.bookingTopRow}>
                            <Text variant="labelLarge" style={styles.bookingRef}>
                              {booking.reference}
                            </Text>
                            <Chip compact mode="flat" style={countdown.style}>
                              {countdown.label}
                            </Chip>
                          </View>

                          {booking.bookingStatus === "arrived" ? (
                            <Chip
                              compact
                              style={styles.warningChip}
                              textStyle={styles.warningChipText}
                            >
                              {missingPassengerDetails ? "Passenger in car: add details" : "Passenger in car: verify now"}
                            </Chip>
                          ) : null}

                          {booking.bookingStatus === "passenger_verified" ? (
                            <Chip compact style={styles.checkedChip}>
                              Checked
                            </Chip>
                          ) : null}

                          <Text variant="titleLarge" style={styles.bookingPassenger}>
                            {booking.customerName === "Passenger details not provided"
                              ? "Passenger details missing"
                              : booking.customerName}
                          </Text>
                          <Text variant="bodyLarge" style={styles.bookingPickup}>
                            {booking.pickupLocationDescription}
                          </Text>
                          <Text variant="bodyMedium" style={styles.bookingTime}>
                            Pickup {booking.pickupTimeLocal}
                          </Text>
                        </Card.Content>
                      </Card>
                    </Pressable>
                  );
                })}
              </>
            ) : null}

            {screen === "booking" && selectedBooking ? (
              <>
                <Header
                  title="Pickup check-in"
                  subtitle="Use this screen only at pickup. Passenger details are completed after the passenger is in the car."
                  onLogout={logout}
                />

                <Button
                  mode="text"
                  onPress={() => setScreen("home")}
                  style={styles.backButton}
                  labelStyle={styles.ctaLabel}
                >
                  Back to pickups
                </Button>

                <Card mode="elevated" style={styles.detailCard}>
                  <Card.Content style={styles.detailContent}>
                    <View style={styles.detailTopRow}>
                      <Text variant="titleLarge">Pickup details</Text>
                      <Chip compact mode="flat" style={getPickupCountdown(selectedBooking.pickupTimeLocal).style}>
                        {getPickupCountdown(selectedBooking.pickupTimeLocal).label}
                      </Chip>
                    </View>

                    <DetailRow label="Reference" value={selectedBooking.reference} />
                    <Divider />
                    <MapRow
                      label="Pickup"
                      value={selectedBooking.pickupLocationDescription}
                      onPress={() => openInGoogleMaps(selectedBooking.pickupLocationDescription)}
                    />
                    <Divider />
                    <DetailRow label="Pickup time" value={selectedBooking.pickupTimeLocal} />
                    <Divider />
                    <DetailRow label="Passenger name" value={selectedBooking.customerName} />
                    <Divider />
                    <DetailRow label="Mobile" value={selectedBooking.customerMobileNumber || "Not provided"} />

                    {selectedBooking.bookingStatus === "assigned" ? (
                      <Button
                        mode="contained"
                        onPress={markPassengerInCar}
                        style={styles.inCarButton}
                        contentStyle={styles.primaryButtonContent}
                        labelStyle={styles.ctaLabel}
                      >
                        Passenger in car
                      </Button>
                    ) : null}
                  </Card.Content>
                </Card>

                {selectedBooking.bookingStatus === "assigned" ? (
                  <Card mode="outlined" style={styles.infoCard}>
                    <Card.Content>
                      <Text variant="titleMedium" style={styles.infoTitle}>
                        Next step
                      </Text>
                      <Text variant="bodyLarge" style={styles.infoBody}>
                        Reach the passenger first. Once the passenger is seated, tap Passenger in car and the form will unlock.
                      </Text>
                    </Card.Content>
                  </Card>
                ) : (
                  <>
                    <Card mode="elevated" style={styles.formCard}>
                      <Card.Content style={styles.formContent}>
                        <Text variant="headlineSmall" style={styles.formTitle}>
                          Passenger details
                        </Text>
                        <Text variant="bodyLarge" style={styles.formBody}>
                          This section is required now. If any detail is missing, add it here before you verify the passenger.
                        </Text>

                        <TextInput
                          mode="outlined"
                          label="Passenger name"
                          value={passengerDraft.customerName}
                          onChangeText={(value) =>
                            setPassengerDraft((current) => ({ ...current, customerName: value }))
                          }
                          style={styles.paperInput}
                        />
                        <TextInput
                          mode="outlined"
                          label="Mobile number"
                          value={passengerDraft.customerMobileNumber}
                          onChangeText={(value) =>
                            setPassengerDraft((current) => ({ ...current, customerMobileNumber: value }))
                          }
                          keyboardType="phone-pad"
                          style={styles.paperInput}
                        />
                        <TextInput
                          mode="outlined"
                          label="Nationality"
                          value={passengerDraft.nationality}
                          onChangeText={(value) =>
                            setPassengerDraft((current) => ({ ...current, nationality: value }))
                          }
                          style={styles.paperInput}
                        />
                        <TextInput
                          mode="outlined"
                          label="Emirates ID number"
                          value={passengerDraft.emiratesIdNumber}
                          onChangeText={(value) =>
                            setPassengerDraft((current) => ({ ...current, emiratesIdNumber: value }))
                          }
                          style={styles.paperInput}
                        />
                        <Text variant="bodySmall" style={styles.helperText}>
                          Required if passport is not available
                        </Text>
                        <TextInput
                          mode="outlined"
                          label="Passport number"
                          value={passengerDraft.passportNumber}
                          onChangeText={(value) =>
                            setPassengerDraft((current) => ({ ...current, passportNumber: value }))
                          }
                          style={styles.paperInput}
                        />
                        <Text variant="bodySmall" style={styles.helperText}>
                          Required if Emirates ID is not available
                        </Text>
                      </Card.Content>
                    </Card>

                    <View style={styles.formActions}>
                      <Button
                        mode="outlined"
                        onPress={savePassengerDetails}
                        contentStyle={styles.secondaryButtonContent}
                        labelStyle={styles.ctaLabel}
                      >
                        Save passenger details
                      </Button>
                      <Button
                        mode="contained"
                        onPress={verifyPassenger}
                        contentStyle={styles.primaryButtonContent}
                        labelStyle={styles.ctaLabel}
                      >
                        Verify passenger now
                      </Button>
                    </View>
                  </>
                )}
              </>
            ) : null}
          </ScrollView>
        )}
      </SafeAreaView>
    </PaperProvider>
  );
}

function Header({
  title,
  subtitle,
  onLogout,
}: {
  title: string;
  subtitle: string;
  onLogout: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTextWrap}>
        <Text variant="labelLarge" style={styles.brandLabel}>
          Carmak Driver
        </Text>
        <Text variant="headlineMedium" style={styles.pageTitle}>
          {title}
        </Text>
        <Text variant="bodyLarge" style={styles.pageSubtitle}>
          {subtitle}
        </Text>
      </View>
      <Button mode="text" onPress={onLogout} labelStyle={styles.ctaLabel}>
        Logout
      </Button>
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Surface style={styles.metricSurface} elevation={0}>
      <Text variant="headlineSmall" style={styles.metricValue}>
        {value}
      </Text>
      <Text variant="bodyMedium" style={styles.metricLabel}>
        {label}
      </Text>
    </Surface>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text variant="labelLarge" style={styles.detailLabel}>
        {label}
      </Text>
      <Text variant="bodyLarge" style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

function MapRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.detailRow}>
        <Text variant="labelLarge" style={styles.detailLabel}>
          {label}
        </Text>
        <Text variant="bodyLarge" style={styles.detailValue}>
          {value}
        </Text>
        <Text variant="bodySmall" style={styles.mapHelper}>
          Launch Google Maps
        </Text>
      </View>
    </Pressable>
  );
}

function getPickupCountdown(pickupTimeLocal: string): {
  label: string;
  tone: "urgent" | "soon" | "normal" | "past";
  style: object;
} {
  const pickupDate = parsePickupDate(pickupTimeLocal);
  if (!pickupDate) {
    return { label: "Pickup time unavailable", tone: "normal", style: styles.countdownNormal };
  }

  const diffMinutes = Math.round((pickupDate.getTime() - Date.now()) / 60000);

  if (diffMinutes < 0) {
    const overdueMinutes = Math.abs(diffMinutes);
    return {
      label: overdueMinutes < 60 ? `${overdueMinutes} min past pickup` : `${Math.floor(overdueMinutes / 60)} hr past pickup`,
      tone: "past",
      style: styles.countdownPast,
    };
  }

  if (diffMinutes <= 15) {
    return { label: `Pickup in ${diffMinutes} min`, tone: "urgent", style: styles.countdownUrgent };
  }

  if (diffMinutes <= 45) {
    return { label: `Pickup in ${diffMinutes} min`, tone: "soon", style: styles.countdownSoon };
  }

  if (diffMinutes < 120) {
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return { label: `Pickup in ${hours}h ${minutes}m`, tone: "normal", style: styles.countdownNormal };
  }

  return {
    label: `Pickup in ${Math.floor(diffMinutes / 60)} hours`,
    tone: "normal",
    style: styles.countdownNormal,
  };
}

function parsePickupDate(value: string): Date | null {
  const normalized = value.replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function openInGoogleMaps(address: string) {
  const encodedAddress = encodeURIComponent(address);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  Linking.openURL(googleMapsUrl).catch(() => {
    Alert.alert("Map unavailable", "Google Maps could not be opened on this device.");
  });
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0E141B",
  },
  loginShell: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#0E141B",
  },
  loginCard: {
    borderRadius: 28,
    backgroundColor: "#151D26",
  },
  loginCardContent: {
    gap: 18,
    paddingVertical: 10,
  },
  loginChip: {
    alignSelf: "flex-start",
    backgroundColor: "#1F3937",
  },
  loginTitle: {
    color: "#F3F7FB",
    fontSize: 32,
    lineHeight: 38,
  },
  loginBody: {
    color: "#A7B7C8",
    fontSize: 18,
    lineHeight: 24,
  },
  testingPanel: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#1A2430",
  },
  testingTitle: {
    color: "#F3F7FB",
    fontSize: 18,
    marginBottom: 4,
  },
  testingBody: {
    color: "#9CB0C3",
    fontSize: 16,
    lineHeight: 20,
  },
  page: {
    padding: 20,
    paddingBottom: 44,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    gap: 6,
  },
  brandLabel: {
    color: "#FFB86B",
    fontSize: 15,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  pageTitle: {
    color: "#F3F7FB",
    fontSize: 30,
    lineHeight: 36,
  },
  pageSubtitle: {
    color: "#9CB0C3",
    fontSize: 17,
    lineHeight: 22,
  },
  heroSurface: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#162A37",
  },
  heroName: {
    color: "#F7FBFF",
    fontSize: 24,
    lineHeight: 30,
  },
  heroMeta: {
    color: "#9FC4D9",
    fontSize: 16,
    marginTop: 4,
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  metricSurface: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#1A2430",
  },
  metricValue: {
    color: "#F3F7FB",
    fontSize: 28,
    lineHeight: 34,
  },
  metricLabel: {
    color: "#9CB0C3",
    fontSize: 16,
    marginTop: 2,
  },
  syncSurface: {
    backgroundColor: "transparent",
  },
  sectionTitle: {
    color: "#F3F7FB",
    fontSize: 22,
    lineHeight: 28,
    marginTop: 10,
    marginBottom: 8,
  },
  bookingCard: {
    borderRadius: 24,
    marginBottom: 12,
    backgroundColor: "#151D26",
  },
  bookingCardContent: {
    gap: 10,
  },
  bookingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  bookingRef: {
    color: "#FFB86B",
    fontSize: 15,
  },
  bookingPassenger: {
    color: "#F3F7FB",
    fontSize: 25,
    lineHeight: 31,
  },
  bookingPickup: {
    color: "#B3C2D1",
    fontSize: 18,
    lineHeight: 22,
  },
  bookingTime: {
    color: "#8FA2B6",
    fontSize: 16,
  },
  warningChip: {
    alignSelf: "flex-start",
    backgroundColor: "#3D241E",
  },
  warningChipText: {
    color: "#FFB5A6",
  },
  checkedChip: {
    alignSelf: "flex-start",
    backgroundColor: "#1F3937",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  detailCard: {
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: "#151D26",
  },
  detailContent: {
    gap: 14,
  },
  detailTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  detailRow: {
    paddingVertical: 6,
    gap: 4,
  },
  detailLabel: {
    color: "#8FA2B6",
    fontSize: 15,
  },
  detailValue: {
    color: "#F3F7FB",
    fontSize: 19,
    lineHeight: 25,
  },
  mapHelper: {
    color: "#73B6FF",
    fontSize: 15,
    marginTop: 2,
  },
  inCarButton: {
    marginTop: 8,
  },
  infoCard: {
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: "#1A2430",
  },
  infoTitle: {
    color: "#F3F7FB",
    fontSize: 22,
    marginBottom: 8,
  },
  infoBody: {
    color: "#9CB0C3",
    fontSize: 17,
    lineHeight: 22,
  },
  formCard: {
    borderRadius: 24,
    marginBottom: 14,
    backgroundColor: "#151D26",
  },
  formContent: {
    gap: 12,
  },
  formTitle: {
    color: "#F3F7FB",
    fontSize: 28,
    lineHeight: 34,
  },
  formBody: {
    color: "#9CB0C3",
    fontSize: 17,
    lineHeight: 22,
  },
  paperInput: {
    backgroundColor: "#121A22",
  },
  helperText: {
    color: "#8FA2B6",
    fontSize: 15,
    lineHeight: 20,
    marginTop: -6,
  },
  formActions: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButtonContent: {
    minHeight: 52,
  },
  secondaryButtonContent: {
    minHeight: 52,
  },
  ctaLabel: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  countdownUrgent: {
    backgroundColor: "#4A2523",
  },
  countdownSoon: {
    backgroundColor: "#4B3720",
  },
  countdownNormal: {
    backgroundColor: "#1F3937",
  },
  countdownPast: {
    backgroundColor: "#34234A",
  },
});
