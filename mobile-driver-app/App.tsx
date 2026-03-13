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
  Text,
  TextInput,
  View,
} from "react-native";
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
  const confirmedCount = bookings.filter((booking) => booking.bookingStatus === "passenger_verified").length;
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

  const confirmPassenger = () => {
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

  const logout = () => {
    setScreen("login");
  };

  if (screen === "login") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          style={styles.loginShell}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.loginCard}>
            <View style={styles.loginIntro}>
              <Text style={styles.loginBadge}>Driver App</Text>
              <Text style={styles.loginTitle}>Complete passenger pickup check-in</Text>
              <Text style={styles.loginText}>
                Drivers only need the pickup location and passenger details. If details are missing, add them once the passenger is in the car.
              </Text>
            </View>

            <Pressable onPress={handleLogin} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Login</Text>
            </Pressable>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Testing mode</Text>
              <Text style={styles.tipText}>This preview opens directly for user testing.</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.page}>
        {screen === "home" ? (
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.brandLabel}>Carmak Driver</Text>
                <Text style={styles.pageTitle}>Today&apos;s pickups</Text>
                <Text style={styles.pageSubtitle}>Open the pickup, reach the passenger, then complete the check-in.</Text>
              </View>
              <Pressable onPress={logout} style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </Pressable>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryDriver}>{demoDriver.name}</Text>
              <Text style={styles.summaryMeta}>Vehicle {demoDriver.assignedVehicle}</Text>
              <View style={styles.summaryRow}>
                <MiniStat label="Need action" value={needsActionCount} />
                <MiniStat label="Checked" value={confirmedCount} />
              </View>
            </View>

            <View style={styles.syncBanner}>
              <View style={[styles.syncDot, pendingSyncCount > 0 ? styles.syncDotActive : styles.syncDotIdle]} />
              <Text style={styles.syncBannerText}>
                {pendingSyncCount > 0
                  ? `${pendingSyncCount} update(s) will sync in background`
                  : "All updates synced"}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Pickups</Text>
            {bookings.map((booking) => {
              const missingPassengerDetails =
                !booking.customerMobileNumber ||
                !booking.nationality ||
                (!booking.emiratesIdNumber && !booking.passportNumber) ||
                booking.customerName === "Passenger details not provided";
              const countdown = getPickupCountdown(booking.pickupTimeLocal);
              const cardTone =
                booking.bookingStatus === "passenger_verified"
                  ? "success"
                  : booking.bookingStatus === "arrived"
                    ? "warning"
                    : "neutral";

              return (
                <Pressable
                  key={booking.id}
                  onPress={() => openBooking(booking.id)}
                  style={[
                    styles.bookingCard,
                    cardTone === "warning"
                      ? styles.bookingCardWarning
                      : cardTone === "success"
                        ? styles.bookingCardSuccess
                        : styles.bookingCardNeutral,
                  ]}
                >
                  <View
                    style={[
                      styles.bookingAccentBar,
                      cardTone === "warning"
                        ? styles.bookingAccentWarning
                        : cardTone === "success"
                          ? styles.bookingAccentSuccess
                          : styles.bookingAccentNeutral,
                    ]}
                  />
                  <View style={styles.bookingTopRow}>
                    <View style={styles.bookingTopMeta}>
                      {booking.bookingStatus === "arrived" ? (
                        <Text style={[styles.bookingStateTitle, styles.bookingStateTitleWarning]}>
                          {missingPassengerDetails ? "PASSENGER IN CAR: ADD DETAILS" : "PASSENGER IN CAR: VERIFY NOW"}
                        </Text>
                      ) : null}
                      {booking.bookingStatus === "passenger_verified" ? (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedBadgeIcon}>✓</Text>
                          <Text style={styles.verifiedBadgeText}>Checked</Text>
                        </View>
                      ) : null}
                      <Text style={styles.bookingRef}>{booking.reference}</Text>
                    </View>
                    <CountdownBadge label={countdown.label} tone={countdown.tone} />
                  </View>
                  <Text style={styles.bookingPassenger}>
                    {booking.customerName === "Passenger details not provided" ? "Passenger details missing" : booking.customerName}
                  </Text>
                  <Text style={styles.bookingRoute}>{booking.pickupLocationDescription}</Text>
                  <Text style={styles.bookingSubtext}>Pickup {booking.pickupTimeLocal}</Text>
                </Pressable>
              );
            })}
          </>
        ) : null}

        {screen === "booking" && selectedBooking ? (
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.brandLabel}>Carmak Driver</Text>
                <Text style={styles.pageTitle}>Pickup check-in</Text>
                <Text style={styles.pageSubtitle}>Reach pickup first. Add or verify passenger details only after the passenger is in the car.</Text>
              </View>
              <Pressable onPress={logout} style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => setScreen("home")} style={styles.backLink}>
              <Text style={styles.backLinkText}>Back to pickups</Text>
            </Pressable>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pickup details</Text>
              <CountdownBadge label={getPickupCountdown(selectedBooking.pickupTimeLocal).label} tone={getPickupCountdown(selectedBooking.pickupTimeLocal).tone} />
              <BookingRow label="Reference" value={selectedBooking.reference} />
              <MapRow label="Pickup" value={selectedBooking.pickupLocationDescription} onPress={() => openInGoogleMaps(selectedBooking.pickupLocationDescription)} />
              <BookingRow label="Pickup time" value={selectedBooking.pickupTimeLocal} />
              <BookingRow label="Passenger name" value={selectedBooking.customerName} />
              <BookingRow label="Mobile" value={selectedBooking.customerMobileNumber || "Not provided"} />
              {selectedBooking.bookingStatus === "assigned" ? (
                <Pressable onPress={markPassengerInCar} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Passenger in car</Text>
                </Pressable>
              ) : null}
            </View>

            {selectedBooking.bookingStatus === "assigned" ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Next step</Text>
                <Text style={styles.cardText}>Navigate to pickup first. Once the passenger is in the car, tap Passenger in car to unlock the passenger form.</Text>
              </View>
            ) : (
              <>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Passenger details required in car</Text>
                  <Text style={styles.cardText}>Check the passenger details now. If anything is missing, add it before verification.</Text>
                  <Field label="Passenger name" value={passengerDraft.customerName} onChangeText={(value) => setPassengerDraft((current) => ({ ...current, customerName: value }))} placeholder={selectedBooking.customerName === "Passenger details not provided" ? "Enter passenger name" : selectedBooking.customerName} />
                  <Field label="Mobile number" value={passengerDraft.customerMobileNumber} onChangeText={(value) => setPassengerDraft((current) => ({ ...current, customerMobileNumber: value }))} placeholder={selectedBooking.customerMobileNumber || "Enter mobile number"} keyboardType="phone-pad" />
                  <Field label="Nationality" value={passengerDraft.nationality} onChangeText={(value) => setPassengerDraft((current) => ({ ...current, nationality: value }))} placeholder={selectedBooking.nationality || "Enter nationality"} />
                  <Field label="Emirates ID number" value={passengerDraft.emiratesIdNumber} onChangeText={(value) => setPassengerDraft((current) => ({ ...current, emiratesIdNumber: value }))} placeholder={selectedBooking.emiratesIdNumber || "Optional if passport is provided"} />
                  <Field label="Passport number" value={passengerDraft.passportNumber} onChangeText={(value) => setPassengerDraft((current) => ({ ...current, passportNumber: value }))} placeholder={selectedBooking.passportNumber || "Optional if Emirates ID is provided"} />
                </View>

                <View style={styles.actionStack}>
                  <Pressable onPress={savePassengerDetails} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Save passenger details</Text>
                  </Pressable>
                  <Pressable onPress={confirmPassenger} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Verify passenger now</Text>
                  </Pressable>
                </View>
              </>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function BookingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.bookingRow}>
      <Text style={styles.bookingRowLabel}>{label}</Text>
      <Text style={styles.bookingRowValue}>{value}</Text>
    </View>
  );
}

function MapRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.bookingRow, styles.mapRow]}>
      <View style={styles.mapRowTextWrap}>
        <Text style={styles.bookingRowLabel}>{label}</Text>
        <Text style={styles.bookingRowValue}>{value}</Text>
        <Text style={styles.mapHelperText}>Launches Google Maps</Text>
      </View>
      <View style={styles.mapLaunchChip}>
        <Text style={styles.mapLaunchChipText}>Launch Google Maps</Text>
      </View>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "phone-pad";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#7d8699"
        keyboardType={keyboardType ?? "default"}
        style={styles.input}
      />
    </View>
  );
}

function CountdownBadge({ label, tone }: { label: string; tone: "urgent" | "soon" | "normal" | "past" }) {
  const toneStyle =
    tone === "urgent"
      ? styles.countdownUrgent
      : tone === "soon"
        ? styles.countdownSoon
        : tone === "past"
          ? styles.countdownPast
          : styles.countdownNormal;
  const textStyle =
    tone === "urgent"
      ? styles.countdownUrgentText
      : tone === "soon"
        ? styles.countdownSoonText
        : tone === "past"
          ? styles.countdownPastText
          : styles.countdownNormalText;

  return (
    <View style={[styles.countdownBadge, toneStyle]}>
      <Text style={[styles.countdownText, textStyle]}>{label}</Text>
    </View>
  );
}

function getPickupCountdown(pickupTimeLocal: string): { label: string; tone: "urgent" | "soon" | "normal" | "past" } {
  const pickupDate = parsePickupDate(pickupTimeLocal);
  if (!pickupDate) {
    return { label: "Pickup time unavailable", tone: "normal" };
  }

  const diffMinutes = Math.round((pickupDate.getTime() - Date.now()) / 60000);

  if (diffMinutes < 0) {
    const overdueMinutes = Math.abs(diffMinutes);
    if (overdueMinutes < 60) {
      return { label: `${overdueMinutes} min past pickup`, tone: "past" };
    }
    const overdueHours = Math.floor(overdueMinutes / 60);
    return { label: `${overdueHours} hr past pickup`, tone: "past" };
  }

  if (diffMinutes <= 15) {
    return { label: `Pickup in ${diffMinutes} min`, tone: "urgent" };
  }

  if (diffMinutes <= 45) {
    return { label: `Pickup in ${diffMinutes} min`, tone: "soon" };
  }

  if (diffMinutes < 120) {
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return { label: `Pickup in ${hours}h ${minutes}m`, tone: "normal" };
  }

  const hours = Math.floor(diffMinutes / 60);
  return { label: `Pickup in ${hours} hours`, tone: "normal" };
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
    backgroundColor: "#07111F",
  },
  loginShell: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#07111F",
  },
  loginCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    gap: 20,
  },
  loginIntro: {
    gap: 10,
  },
  loginBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E7F1FF",
    color: "#1456C1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0E1726",
  },
  loginText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536179",
  },
  page: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  brandLabel: {
    color: "#8FB8FF",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pageTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 6,
  },
  pageSubtitle: {
    color: "#AAC0E0",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 280,
  },
  logoutButton: {
    backgroundColor: "#12233D",
    borderColor: "#203A61",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: "#0F1E34",
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1B3250",
    marginBottom: 16,
  },
  summaryDriver: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  summaryMeta: {
    color: "#C1D1E5",
    marginTop: 6,
  },
  summaryRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  miniStat: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginRight: 12,
  },
  miniStatValue: {
    color: "#0E1726",
    fontSize: 22,
    fontWeight: "800",
  },
  miniStatLabel: {
    color: "#607086",
    fontWeight: "600",
    marginTop: 4,
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#12233D",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  syncDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 10,
  },
  syncDotActive: {
    backgroundColor: "#F79009",
  },
  syncDotIdle: {
    backgroundColor: "#12B76A",
  },
  syncBannerText: {
    color: "#D4E2F3",
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
  },
  bookingCardWarning: {
    borderColor: "#F79009",
    backgroundColor: "#FFFDF8",
  },
  bookingCardSuccess: {
    borderColor: "#12B76A",
    backgroundColor: "#FBFEFC",
  },
  bookingCardNeutral: {
    borderColor: "#D8E2F0",
    backgroundColor: "#FFFFFF",
  },
  bookingAccentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
  },
  bookingAccentWarning: {
    backgroundColor: "#F79009",
  },
  bookingAccentSuccess: {
    backgroundColor: "#12B76A",
  },
  bookingAccentNeutral: {
    backgroundColor: "#1456C1",
  },
  bookingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bookingTopMeta: {
    flex: 1,
  },
  bookingStateTitle: {
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  bookingStateTitleWarning: {
    color: "#9A3412",
  },
  verifiedBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DDF8E8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 4,
  },
  verifiedBadgeIcon: {
    color: "#0E6B4A",
    fontSize: 13,
    fontWeight: "900",
    marginRight: 6,
  },
  verifiedBadgeText: {
    color: "#0E6B4A",
    fontSize: 12,
    fontWeight: "800",
  },
  bookingRef: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1456C1",
    letterSpacing: 0.4,
  },
  bookingPassenger: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0E1726",
    marginTop: 10,
  },
  countdownBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: "800",
  },
  countdownUrgent: {
    backgroundColor: "#FFE4E8",
  },
  countdownUrgentText: {
    color: "#B42318",
  },
  countdownSoon: {
    backgroundColor: "#FFF2D6",
  },
  countdownSoonText: {
    color: "#B54708",
  },
  countdownNormal: {
    backgroundColor: "#E7F1FF",
  },
  countdownNormalText: {
    color: "#1456C1",
  },
  countdownPast: {
    backgroundColor: "#F4E8FF",
  },
  countdownPastText: {
    color: "#7A2BBF",
  },
  bookingRoute: {
    color: "#59677C",
    lineHeight: 20,
    marginTop: 8,
  },
  bookingSubtext: {
    color: "#7A879B",
    fontWeight: "600",
    marginTop: 6,
  },
  backLink: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backLinkText: {
    color: "#9EC4FF",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    color: "#0E1726",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  cardText: {
    color: "#5F6C80",
    lineHeight: 20,
  },
  bookingRow: {
    backgroundColor: "#F6F8FB",
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },
  mapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mapRowTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  mapHelperText: {
    color: "#607086",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  mapLaunchChip: {
    backgroundColor: "#E7F1FF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapLaunchChipText: {
    color: "#1456C1",
    fontWeight: "800",
    fontSize: 12,
    textAlign: "center",
  },
  bookingRowLabel: {
    color: "#607086",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  bookingRowValue: {
    color: "#0E1726",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  field: {
    marginTop: 12,
  },
  fieldLabel: {
    color: "#344054",
    fontWeight: "700",
    marginBottom: 8,
  },
  actionStack: {
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: "#1456C1",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D3DCE7",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#0E1726",
    fontSize: 16,
    fontWeight: "800",
  },
  tipCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F4F7FB",
  },
  tipTitle: {
    color: "#0E1726",
    fontWeight: "800",
  },
  tipText: {
    color: "#5F6C80",
    marginTop: 3,
  },
});
